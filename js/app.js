/**
 * Main Application Controller
 * Manages SPA routing, state, UI orchestration, and integrations.
 */
const App = (() => {

  /* ---- App State ---- */
  let state = {
    role: 'student',   // 'student' | 'teacher'
    user: null,
    selectedRobot: 'magician', // 'magician' | 'ai_starter' | 'magician_ai'
    currentView: 'dashboard',
    currentRepo: null,
    currentFile: null,
    currentFileSha: null,
    blocklyReady: false,
    monacoReady: false,
    editorMode: 'blockly',  // 'blockly' | 'python' | 'eventsheet'
    assignments: [],
    repos: [],
    orgs: [],
    students: [],
    autoSaveTimer: null,
  };

  /* ---- Toast Notifications ---- */
  const toast = (title, message = '', type = 'info', duration = 4000) => {
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), duration);
  };

  /* ---- View Navigation ---- */
  const showView = (viewId) => {
    document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));
    const view = document.getElementById(`view-${viewId}`);
    if (view) view.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`[data-view="${viewId}"]`);
    if (navItem) navItem.classList.add('active');

    state.currentView = viewId;
    updateHeaderTitle(viewId);

    // Trigger view-specific initialization
    if (viewId === 'editor' && !state.blocklyReady) initBlockly();
    if (viewId === 'dashboard') refreshDashboard();
    if (viewId === 'teacher') refreshTeacherDashboard();
    if (viewId === 'repositories') refreshRepositories();
  };

  const updateHeaderTitle = (viewId) => {
    const titles = {
      dashboard:    ['📋 My Assignments', 'Student Dashboard'],
      editor:       ['💻 Code Editor', state.currentRepo ? `Working on: ${state.currentRepo}` : 'Open or create a file'],
      teacher:      ['👩‍🏫 Teacher Dashboard', 'Student progress & grading'],
      repositories: ['📁 Repositories', 'GitHub Classroom'],
      vex:          ['🎮 VEX Upload', 'Upload VEX code to GitHub'],
      settings:     ['⚙️ Settings', 'Robot & account configuration'],
    };
    const t = titles[viewId] || [viewId, ''];
    document.getElementById('header-title').textContent = t[0];
    document.getElementById('header-subtitle').textContent = t[1];
  };

  /* ---- Authentication ---- */
  const initAuth = () => {
    const savedToken = GitHubAPI.getToken();
    if (savedToken) {
      // Try auto-login
      GitHubAPI.getUser()
        .then(user => {
          state.user = user;
          enterApp();
        })
        .catch(() => {
          // Token invalid
          GitHubAPI.clearToken();
          showWelcome();
        });
    } else {
      showWelcome();
    }
  };

  const showWelcome = () => {
    document.getElementById('welcome-screen').classList.remove('hidden');
    document.getElementById('app-shell').classList.add('hidden');
  };

  const enterApp = () => {
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
    updateUserDisplay();
    showView('dashboard');
  };

  const handleLogin = async () => {
    const tokenInput = document.getElementById('gh-token');
    const token = tokenInput.value.trim();
    if (!token) {
      toast('Token Required', 'Please enter your GitHub Personal Access Token.', 'error');
      return;
    }

    const btn = document.getElementById('login-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div> Connecting...';

    try {
      GitHubAPI.setToken(token);
      const user = await GitHubAPI.getUser();
      state.user = user;
      state.role = document.querySelector('.role-btn.active')?.dataset.role || 'student';
      localStorage.setItem('user_role', state.role);
      toast('Welcome!', `Logged in as ${user.login}`, 'success');
      enterApp();
    } catch (e) {
      GitHubAPI.clearToken();
      toast('Login Failed', e.message, 'error');
      btn.disabled = false;
      btn.innerHTML = '🚀 Connect & Enter';
    }
  };

  const handleLogout = () => {
    GitHubAPI.clearToken();
    state.user = null;
    state.repos = [];
    state.assignments = [];
    showWelcome();
    toast('Logged Out', 'See you next time!', 'info');
  };

  const updateUserDisplay = () => {
    const user = state.user;
    if (!user) return;
    const nameEl = document.getElementById('sidebar-username');
    const roleEl = document.getElementById('sidebar-role');
    const avatarEl = document.getElementById('sidebar-avatar');
    if (nameEl) nameEl.textContent = user.login;
    if (roleEl) roleEl.textContent = state.role === 'teacher' ? '👩‍🏫 Teacher' : '🎓 Student';
    if (avatarEl && user.avatar_url) {
      avatarEl.innerHTML = `<img src="${user.avatar_url}" alt="${user.login}">`;
    } else if (avatarEl) {
      avatarEl.textContent = (user.login || 'U')[0].toUpperCase();
    }
    // Show/hide teacher nav
    const teacherNav = document.getElementById('teacher-nav-item');
    if (teacherNav) {
      teacherNav.classList.toggle('hidden', state.role !== 'teacher');
    }
  };

  /* ---- Dashboard ---- */
  const refreshDashboard = async () => {
    const container = document.getElementById('assignments-list');
    if (!container) return;

    container.innerHTML = `
      <div class="loading-overlay" style="position:relative;background:none;min-height:100px;">
        <div class="spinner"></div><div style="color:#64748b;font-size:13px;">Loading repositories...</div>
      </div>`;

    try {
      const repos = await GitHubAPI.getUserRepos();
      state.repos = repos;
      renderAssignmentList(repos, container);
      document.getElementById('stat-repos').textContent = repos.length;
    } catch (e) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-title">Could Not Load Repositories</div>
        <div class="empty-state-desc">${e.message}</div>
      </div>`;
    }
  };

  const renderAssignmentList = (repos, container) => {
    if (!repos.length) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-title">No Repositories Found</div>
        <div class="empty-state-desc">Your GitHub Classroom assignments will appear here.</div>
        <button class="btn btn-primary" onclick="App.showView('repositories')">Browse Repositories</button>
      </div>`;
      return;
    }

    const statusMap = { open: 'badge-blue', 'In Progress': 'badge-amber', Submitted: 'badge-green' };

    container.innerHTML = `<div class="assignment-list">
      ${repos.slice(0, 20).map(repo => `
        <div class="assignment-card" onclick="App.openRepo('${repo.full_name}')">
          <div class="assignment-icon">📁</div>
          <div class="assignment-info">
            <div class="assignment-title">${repo.name}</div>
            <div class="assignment-meta">
              ${repo.owner.login} • Updated ${timeAgo(repo.updated_at)}
              ${repo.private ? ' 🔒' : ''}
            </div>
          </div>
          <div class="assignment-status">
            <span class="badge badge-blue">Open</span>
            <span class="text-muted" style="font-size:18px;">›</span>
          </div>
        </div>
      `).join('')}
    </div>`;
  };

  const openRepo = async (fullName) => {
    const [owner, repo] = fullName.split('/');
    state.currentRepo = fullName;
    showView('editor');
    updateHeaderTitle('editor');

    toast('Opening Repository', `Loading ${repo}...`, 'info', 2000);

    // Load file tree
    try {
      const tree = await GitHubAPI.getRepoTree(owner, repo);
      renderFileTree(tree.tree || []);
    } catch (e) {
      toast('Could Not Load Files', e.message, 'error');
    }
  };

  /* ---- File Tree ---- */
  const renderFileTree = (tree) => {
    const container = document.getElementById('file-tree');
    if (!container) return;
    const files = tree.filter(f => f.type === 'blob').slice(0, 50);
    container.innerHTML = files.map(f => `
      <div class="repo-item" onclick="App.openFile('${f.path}')">
        <span class="repo-item-icon">${fileIcon(f.path)}</span>
        <span class="repo-item-name">${f.path}</span>
      </div>
    `).join('') || '<div class="text-muted text-sm" style="padding:12px">No files found</div>';
  };

  const fileIcon = (path) => {
    if (path.endsWith('.py'))                           return '🐍';
    if (path.endsWith('.xml'))                          return '🧩';
    if (path.endsWith('.json'))                         return '📋';
    if (path.endsWith('.md'))                           return '📄';
    if (path.endsWith('.txt'))                          return '📝';
    if (path.endsWith('.vex') || path.endsWith('.v5python')) return '🎮';
    return '📄';
  };

  const openFile = async (filePath) => {
    if (!state.currentRepo) return;
    const [owner, repo] = state.currentRepo.split('/');

    try {
      const file = await GitHubAPI.getFileContents(owner, repo, filePath);
      const content = decodeURIComponent(escape(atob(file.content.replace(/\n/g, ''))));
      state.currentFile = filePath;
      state.currentFileSha = file.sha;

      if (filePath.endsWith('.xml')) {
        // Blockly workspace
        showEditorTab('blockly');
        BlocklySetup.loadWorkspaceXml(content);
      } else if (filePath.endsWith('.json')) {
        // Event sheet
        showEditorTab('eventsheet');
        EventSheet.fromJSON(content);
      } else {
        // Python or text
        showEditorTab('python');
        if (window.monacoEditor) window.monacoEditor.setValue(content);
        else document.getElementById('py-textarea').value = content;
      }

      document.getElementById('current-file-name').textContent = filePath;
      toast('File Opened', `Editing: ${filePath}`, 'success', 2000);
    } catch (e) {
      toast('Could Not Open File', e.message, 'error');
    }
  };

  /* ---- Editor ---- */
  const initBlockly = () => {
    if (state.blocklyReady) return;
    if (typeof Blockly === 'undefined') {
      document.getElementById('blockly-loading').textContent = '⚠️ Blockly not loaded. Check internet connection.';
      return;
    }
    try {
      BlocklySetup.init('blockly-container');
      state.blocklyReady = true;
      document.getElementById('blockly-loading')?.classList.add('hidden');

      // Listen for code changes
      BlocklySetup.getWorkspace().addChangeListener(() => {
        const code = BlocklySetup.getPythonCode();
        if (window.monacoEditor && state.editorMode === 'python') {
          // Don't overwrite if user is editing
        }
        scheduleAutoSave();
      });
    } catch (e) {
      document.getElementById('blockly-loading').textContent = `Error: ${e.message}`;
    }
  };

  const showEditorTab = (tab) => {
    state.editorMode = tab;
    document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${tab}`)?.classList.add('active');

    document.querySelectorAll('.editor-panel').forEach(p => p.classList.add('hidden'));
    document.getElementById(`panel-${tab}`)?.classList.remove('hidden');

    if (tab === 'blockly') initBlockly();
    if (tab === 'python' && !state.monacoReady) initMonaco();
    if (tab === 'eventsheet') {
      EventSheet.init('event-sheet-container', () => scheduleAutoSave());
    }
  };

  const initMonaco = () => {
    if (state.monacoReady || typeof monaco === 'undefined') {
      // Fallback to textarea
      document.getElementById('py-monaco-container').classList.add('hidden');
      document.getElementById('py-textarea-container').classList.remove('hidden');
      return;
    }
    try {
      window.monacoEditor = monaco.editor.create(document.getElementById('py-monaco'), {
        language: 'python',
        theme: 'vs-dark',
        fontSize: 14,
        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
        minimap: { enabled: false },
        lineNumbers: 'on',
        wordWrap: 'on',
        automaticLayout: true,
        padding: { top: 12 },
        value: '# Write your Python code here\nimport time\nfrom dobot_wrapper import DobotRobot\n\nrobot = DobotRobot()\n\n# Example:\nrobot.move_home()\ntime.sleep(1)\nrobot.grab()\n',
      });
      state.monacoReady = true;
      window.monacoEditor.onDidChangeModelContent(() => scheduleAutoSave());
    } catch (e) {
      document.getElementById('py-monaco-container').classList.add('hidden');
      document.getElementById('py-textarea-container').classList.remove('hidden');
    }
  };

  /* ---- Auto Save / Push ---- */
  const scheduleAutoSave = () => {
    clearTimeout(state.autoSaveTimer);
    state.autoSaveTimer = setTimeout(() => {
      const indicator = document.getElementById('save-indicator');
      if (indicator) indicator.textContent = '💾 Unsaved changes';
    }, 500);
  };

  const saveCurrentFile = async (commitMsg) => {
    if (!state.currentRepo || !state.currentFile) {
      toast('Nothing to Save', 'Open a file or repository first.', 'warning');
      return;
    }

    const [owner, repo] = state.currentRepo.split('/');
    const content = getCurrentEditorContent();
    const fileName = state.currentFile;
    const msg = commitMsg || `Update ${fileName} from Robotics Classroom`;

    try {
      const result = await GitHubAPI.saveFile(owner, repo, fileName, content, msg);
      state.currentFileSha = result.content?.sha;
      document.getElementById('save-indicator').textContent = '✅ Saved to GitHub';
      setTimeout(() => {
        const el = document.getElementById('save-indicator');
        if (el) el.textContent = '';
      }, 3000);
      toast('Saved!', `${fileName} pushed to GitHub`, 'success');
    } catch (e) {
      toast('Save Failed', e.message, 'error');
    }
  };

  const getCurrentEditorContent = () => {
    switch (state.editorMode) {
      case 'blockly':
        return BlocklySetup.getWorkspaceXml();
      case 'python':
        if (window.monacoEditor) return window.monacoEditor.getValue();
        return document.getElementById('py-textarea').value;
      case 'eventsheet':
        return EventSheet.toJSON();
      default:
        return '';
    }
  };

  const generateAndSwitchToPython = () => {
    let code = '';
    if (state.editorMode === 'blockly') {
      code = BlocklySetup.getPythonCode();
    } else if (state.editorMode === 'eventsheet') {
      code = EventSheet.toPython();
    } else {
      return;
    }
    showEditorTab('python');
    setTimeout(() => {
      if (window.monacoEditor) window.monacoEditor.setValue(code);
      else document.getElementById('py-textarea').value = code;
    }, 100);
    toast('Code Generated', 'Python code generated from your program', 'success');
  };

  /* Normalize speed action IDs (set_speed_slow → set_speed, etc.) */
  const normalizeCommandType = (id) => {
    if (id === 'set_speed_slow' || id === 'set_speed_med' || id === 'set_speed_fast') {
      return 'set_speed';
    }
    return id;
  };

  const runInSimulator = () => {
    // Build command list from current editor
    let commands = [];
    if (state.editorMode === 'blockly' && state.blocklyReady) {
      // Parse from Blockly workspace (simplified simulation)
      const workspace = BlocklySetup.getWorkspace();
      const blocks = workspace.getAllBlocks(true);
      blocks.forEach(block => {
        commands.push(...blockToCommands(block));
      });
    } else if (state.editorMode === 'eventsheet') {
      // Simplified: run all event rows' actions
      const rows = JSON.parse(EventSheet.toJSON() || '[]');
      rows.forEach(row => {
        row.actions.forEach(action => {
          commands.push({ type: normalizeCommandType(action.id), args: action.param !== undefined ? [action.param] : [] });
        });
      });
    }
    if (commands.length === 0) {
      toast('Nothing to Run', 'Add some blocks or events first!', 'warning');
      return;
    }
    RobotSimulator.execute(commands);
  };

  const blockToCommands = (block) => {
    const cmds = [];
    const numVal = (block, field) => {
      const input = block.getInput(field);
      if (input && input.connection && input.connection.targetBlock()) {
        return Number(input.connection.targetBlock().getFieldValue('NUM') || 10);
      }
      return 10;
    };
    switch (block.type) {
      case 'dobot_move_home':      cmds.push({ type: 'move_home',     args: [] }); break;
      case 'dobot_move_forward':   cmds.push({ type: 'move_forward',  args: [numVal(block, 'DISTANCE')] }); break;
      case 'dobot_move_backward':  cmds.push({ type: 'move_backward', args: [numVal(block, 'DISTANCE')] }); break;
      case 'dobot_move_left':      cmds.push({ type: 'move_left',     args: [numVal(block, 'DISTANCE')] }); break;
      case 'dobot_move_right':     cmds.push({ type: 'move_right',    args: [numVal(block, 'DISTANCE')] }); break;
      case 'dobot_move_up':        cmds.push({ type: 'move_up',       args: [numVal(block, 'DISTANCE')] }); break;
      case 'dobot_move_down':      cmds.push({ type: 'move_down',     args: [numVal(block, 'DISTANCE')] }); break;
      case 'dobot_grab':           cmds.push({ type: 'grab',          args: [] }); break;
      case 'dobot_release':        cmds.push({ type: 'release',       args: [] }); break;
      case 'dobot_claw_open':      cmds.push({ type: 'claw_open',     args: [] }); break;
      case 'dobot_claw_close':     cmds.push({ type: 'claw_close',    args: [] }); break;
      case 'dobot_beep':           cmds.push({ type: 'beep',          args: [] }); break;
      case 'dobot_wait':           cmds.push({ type: 'wait',          args: [numVal(block, 'SECONDS')] }); break;
      case 'dobot_ai_grab_detected': cmds.push({ type: 'ai_grab_detected', args: [] }); break;
      case 'dobot_ai_follow_line': cmds.push({ type: 'ai_follow_line', args: [] }); break;
    }
    return cmds;
  };

  /* ---- Teacher Dashboard ---- */
  const refreshTeacherDashboard = async () => {
    const container = document.getElementById('students-table-body');
    if (!container) return;

    container.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:24px;">
      <div class="spinner" style="margin:0 auto 8px;"></div>Loading...
    </td></tr>`;

    try {
      const orgs = await GitHubAPI.getOrgs();
      state.orgs = orgs;

      // Render org selector
      const orgSel = document.getElementById('teacher-org-select');
      if (orgSel) {
        orgSel.innerHTML = `<option value="">-- Select Classroom/Org --</option>` +
          orgs.map(o => `<option value="${o.login}">${o.login}</option>`).join('');
      }

      container.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:24px;">
        Select a classroom above to see students
      </td></tr>`;
      document.getElementById('stat-classes').textContent = orgs.length;
    } catch (e) {
      container.innerHTML = `<tr><td colspan="5" class="text-center" style="padding:24px;color:#dc2626;">
        ${e.message}
      </td></tr>`;
    }
  };

  const loadOrgRepos = async (org) => {
    if (!org) return;
    const container = document.getElementById('students-table-body');
    container.innerHTML = '<tr><td colspan="5" class="text-center" style="padding:24px;"><div class="spinner" style="margin:0 auto"></div></td></tr>';

    try {
      const repos = await GitHubAPI.getOrgRepos(org);
      state.repos = repos;
      document.getElementById('stat-repos').textContent = repos.length;

      container.innerHTML = repos.slice(0, 30).map(repo => {
        const initials = repo.name.slice(0, 2).toUpperCase();
        const progress = Math.floor(Math.random() * 100); // Placeholder
        return `
          <tr>
            <td>
              <div class="student-name">
                <div class="student-avatar" style="background:hsl(${repo.name.length * 20},60%,45%)">${initials}</div>
                <span>${repo.name}</span>
              </div>
            </td>
            <td><span class="badge badge-blue">${repo.default_branch || 'main'}</span></td>
            <td>${timeAgo(repo.updated_at)}</td>
            <td>
              <div class="progress-bar" style="width:120px;">
                <div class="progress-fill" style="width:${progress}%"></div>
              </div>
            </td>
            <td>
              <button class="btn btn-outline btn-sm" onclick="App.openRepo('${repo.full_name}')">View Code</button>
            </td>
          </tr>`;
      }).join('') || `<tr><td colspan="5" class="text-center text-muted" style="padding:24px;">No repos found in ${org}</td></tr>`;
    } catch (e) {
      container.innerHTML = `<tr><td colspan="5" class="text-center" style="padding:24px;color:#dc2626;">${e.message}</td></tr>`;
    }
  };

  /* ---- Repositories View ---- */
  const refreshRepositories = async () => {
    const container = document.getElementById('repo-list');
    if (!container) return;

    container.innerHTML = '<div class="loading-overlay" style="position:relative;background:none;min-height:100px;"><div class="spinner"></div></div>';

    try {
      const repos = await GitHubAPI.getUserRepos();
      state.repos = repos;
      container.innerHTML = repos.map(repo => `
        <div class="repo-item" onclick="App.openRepo('${repo.full_name}')">
          <span class="repo-item-icon">📁</span>
          <div style="flex:1;min-width:0;">
            <div class="repo-item-name">${repo.full_name}</div>
            <div class="repo-item-meta">${repo.description || 'No description'} • ${timeAgo(repo.updated_at)}</div>
          </div>
          <span class="badge ${repo.private ? 'badge-gray' : 'badge-blue'}">${repo.private ? '🔒 Private' : '🌐 Public'}</span>
        </div>
      `).join('') || '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">No repositories found</div></div>';
    } catch (e) {
      container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-title">${e.message}</div></div>`;
    }
  };

  /* ---- VEX Upload ---- */
  const initVexUpload = () => {
    const zone = document.getElementById('vex-drop-zone');
    if (!zone) return;

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('dragover');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('dragover');
      handleVexFiles(e.dataTransfer.files);
    });
    document.getElementById('vex-file-input')?.addEventListener('change', (e) => {
      handleVexFiles(e.target.files);
    });
  };

  const handleVexFiles = async (files) => {
    if (!files.length) return;
    const file = files[0];
    const preview = document.getElementById('vex-preview');
    const uploadBtn = document.getElementById('vex-upload-btn');

    const reader = new FileReader();
    reader.onload = (e) => {
      preview.textContent = e.target.result.slice(0, 2000) + (e.target.result.length > 2000 ? '\n...(truncated)' : '');
      preview.parentElement.classList.remove('hidden');
      uploadBtn.dataset.filename = file.name;
      uploadBtn.dataset.content = e.target.result;
      uploadBtn.classList.remove('hidden');
    };
    reader.readAsText(file);
  };

  const uploadVexFile = async () => {
    const btn = document.getElementById('vex-upload-btn');
    const repoInput = document.getElementById('vex-repo-input').value.trim();
    const fileName = btn.dataset.filename;
    const content = btn.dataset.content;

    if (!repoInput || !repoInput.includes('/')) {
      toast('Repo Required', 'Enter repo as owner/repository-name', 'error');
      return;
    }
    if (!fileName) {
      toast('No File', 'Drop a file first', 'error');
      return;
    }

    const [owner, repo] = repoInput.split('/');
    const targetPath = `vex/${fileName}`;

    try {
      btn.disabled = true;
      btn.textContent = 'Uploading...';
      await GitHubAPI.saveFile(owner, repo, targetPath, content, `Upload VEX file: ${fileName}`);
      toast('Uploaded!', `${fileName} → ${repoInput}/${targetPath}`, 'success');
      btn.textContent = '✅ Uploaded!';
    } catch (e) {
      toast('Upload Failed', e.message, 'error');
      btn.disabled = false;
      btn.textContent = '⬆️ Upload to GitHub';
    }
  };

  /* ---- Settings ---- */
  const renderRobotSelector = () => {
    const robots = [
      { id: 'magician',    icon: '🦾', name: 'Dobot Magician',       desc: 'Classic 4-axis robot arm with suction & claw' },
      { id: 'ai_starter',  icon: '🤖', name: 'Dobot AI Starter',     desc: 'AI-powered mobile robot with camera' },
      { id: 'magician_ai', icon: '🧠', name: 'Dobot Magician + AI',  desc: 'Magician arm with AI camera kit' },
      { id: 'vex',         icon: '🎮', name: 'VEX Robot',            desc: 'VEX IQ or V5 robotics system' },
    ];

    const container = document.getElementById('robot-cards');
    if (!container) return;
    container.innerHTML = robots.map(r => `
      <div class="robot-card ${state.selectedRobot === r.id ? 'selected' : ''}"
           onclick="App.selectRobot('${r.id}')">
        <div class="robot-card-icon">${r.icon}</div>
        <div class="robot-card-name">${r.name}</div>
        <div class="robot-card-desc">${r.desc}</div>
        ${state.selectedRobot === r.id ? '<span class="badge badge-blue" style="margin-top:8px;">✓ Selected</span>' : ''}
      </div>
    `).join('');
  };

  const selectRobot = (id) => {
    state.selectedRobot = id;
    localStorage.setItem('selected_robot', id);
    renderRobotSelector();
    updateRobotStatus();
    toast('Robot Selected', `Now coding for: ${id}`, 'success', 2000);
  };

  const updateRobotStatus = () => {
    const label = document.getElementById('robot-status-label');
    const sub = document.getElementById('robot-status-sub');
    const robots = { magician: 'Dobot Magician', ai_starter: 'Dobot AI Starter', magician_ai: 'Magician + AI', vex: 'VEX Robot' };
    if (label) label.textContent = robots[state.selectedRobot] || 'No Robot';
    if (sub) sub.textContent = 'Simulator Mode';
  };

  /* ---- Search ---- */
  const searchRepos = async (query) => {
    if (!query.trim()) { refreshRepositories(); return; }
    const container = document.getElementById('repo-list');
    container.innerHTML = '<div class="loading-overlay" style="position:relative;background:none;min-height:60px;"><div class="spinner"></div></div>';
    try {
      const result = await GitHubAPI.searchRepos(`${query} user:${state.user?.login}`);
      state.repos = result.items || [];
      container.innerHTML = state.repos.map(repo => `
        <div class="repo-item" onclick="App.openRepo('${repo.full_name}')">
          <span class="repo-item-icon">📁</span>
          <div style="flex:1"><div class="repo-item-name">${repo.full_name}</div></div>
        </div>`).join('') || '<div class="text-muted text-sm" style="padding:16px;">No results</div>';
    } catch (e) {
      container.innerHTML = `<div class="text-muted" style="padding:16px;">${e.message}</div>`;
    }
  };

  /* ---- Utilities ---- */
  const timeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 30) return date.toLocaleDateString();
    if (days > 0)  return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  /* ---- Init ---- */
  const init = () => {
    // Restore saved state
    state.role = localStorage.getItem('user_role') || 'student';
    state.selectedRobot = localStorage.getItem('selected_robot') || 'magician';

    // Initialize auth
    initAuth();

    // Role buttons
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.role = btn.dataset.role;
      });
    });

    // Pre-select saved role
    const roleBtn = document.querySelector(`.role-btn[data-role="${state.role}"]`);
    if (roleBtn) roleBtn.classList.add('active');

    // Login button
    document.getElementById('login-btn')?.addEventListener('click', handleLogin);
    document.getElementById('gh-token')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleLogin();
    });

    // Navigation
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.addEventListener('click', () => showView(item.dataset.view));
    });

    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    // Editor tabs
    document.querySelectorAll('.editor-tab[data-tab]').forEach(tab => {
      tab.addEventListener('click', () => showEditorTab(tab.dataset.tab));
    });

    // Save button
    document.getElementById('save-btn')?.addEventListener('click', () => {
      const msg = prompt('Commit message (optional):') || undefined;
      saveCurrentFile(msg);
    });

    // Generate Python button
    document.getElementById('generate-python-btn')?.addEventListener('click', generateAndSwitchToPython);

    // Run in simulator
    document.getElementById('run-simulator-btn')?.addEventListener('click', runInSimulator);
    document.getElementById('stop-simulator-btn')?.addEventListener('click', () => RobotSimulator.stop());
    document.getElementById('reset-simulator-btn')?.addEventListener('click', () => RobotSimulator.reset());

    // Simulator init
    RobotSimulator.init('robot-canvas');

    // Settings
    document.getElementById('settings-link')?.addEventListener('click', () => {
      showView('settings');
      renderRobotSelector();
    });

    // Teacher org select
    document.getElementById('teacher-org-select')?.addEventListener('change', (e) => {
      loadOrgRepos(e.target.value);
    });

    // VEX upload
    initVexUpload();
    document.getElementById('vex-upload-btn')?.addEventListener('click', uploadVexFile);

    // Repo search
    document.getElementById('repo-search')?.addEventListener('input', (e) => {
      clearTimeout(state._searchTimer);
      state._searchTimer = setTimeout(() => searchRepos(e.target.value), 500);
    });

    // New file button
    document.getElementById('new-file-btn')?.addEventListener('click', () => {
      const name = prompt('File name (e.g., main.py or program.xml):');
      if (!name) return;
      state.currentFile = name;
      state.currentFileSha = null;
      if (name.endsWith('.xml')) showEditorTab('blockly');
      else if (name.endsWith('.json')) showEditorTab('eventsheet');
      else showEditorTab('python');
      document.getElementById('current-file-name').textContent = name;
    });

    // Update UI
    updateRobotStatus();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (state.currentView === 'editor') saveCurrentFile();
      }
    });
  };

  return {
    init,
    showView,
    openRepo,
    openFile,
    selectRobot,
    saveCurrentFile,
    refreshDashboard,
    loadOrgRepos,
    generateAndSwitchToPython,
  };
})();

// ── Bootstrap ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
