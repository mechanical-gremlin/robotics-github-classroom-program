/**
 * GitHub API Integration Module
 * Handles all GitHub API calls for Classroom integration
 */
const GitHubAPI = (() => {
  const BASE_URL = 'https://api.github.com';
  let token = null;
  let currentUser = null;

  const setToken = (t) => {
    token = t;
    localStorage.setItem('gh_token', t);
  };

  const getToken = () => token || localStorage.getItem('gh_token');

  const clearToken = () => {
    token = null;
    currentUser = null;
    localStorage.removeItem('gh_token');
  };

  const request = async (path, options = {}) => {
    const t = getToken();
    if (!t) throw new Error('Not authenticated. Please set your GitHub token.');

    const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${t}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `GitHub API error: ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
  };

  /* ---------- Auth ---------- */
  const getUser = async () => {
    currentUser = await request('/user');
    return currentUser;
  };

  const getCurrentUser = () => currentUser;

  /* ---------- Organizations / Classrooms ---------- */
  const getOrgs = async () => {
    return request('/user/orgs?per_page=100');
  };

  /* ---------- Repositories ---------- */
  const getUserRepos = async (page = 1) => {
    return request(`/user/repos?per_page=50&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`);
  };

  const getOrgRepos = async (org, page = 1) => {
    return request(`/orgs/${encodeURIComponent(org)}/repos?per_page=50&page=${page}&sort=updated`);
  };

  const getRepo = async (owner, repo) => {
    return request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
  };

  /* ---------- File Operations ---------- */
  const getFileContents = async (owner, repo, path) => {
    return request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}`);
  };

  const getRepoTree = async (owner, repo, branch = 'main') => {
    // Try main, then master
    try {
      return await request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${branch}?recursive=1`);
    } catch (_) {
      return request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/master?recursive=1`);
    }
  };

  const createOrUpdateFile = async (owner, repo, filePath, content, message, sha = null) => {
    const body = {
      message,
      content: btoa(unescape(encodeURIComponent(content))), // UTF-8 to base64
    };
    if (sha) body.sha = sha;

    return request(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(filePath)}`,
      { method: 'PUT', body: JSON.stringify(body) }
    );
  };

  const saveFile = async (owner, repo, filePath, content, commitMessage) => {
    let sha = null;
    try {
      const existing = await getFileContents(owner, repo, filePath);
      sha = existing.sha;
    } catch (_) {
      // File doesn't exist yet - will create
    }
    return createOrUpdateFile(owner, repo, filePath, content, commitMessage || `Update ${filePath}`, sha);
  };

  /* ---------- Commits ---------- */
  const getCommits = async (owner, repo, path = null) => {
    const q = path ? `?path=${encodeURIComponent(path)}&per_page=10` : '?per_page=10';
    return request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits${q}`);
  };

  /* ---------- Classroom Helpers ---------- */
  // GitHub Classroom API (requires special scope - graceful fallback)
  const getClassrooms = async () => {
    try {
      return await request('/classrooms');
    } catch (_) {
      // Fallback: use orgs as classrooms
      return getOrgs();
    }
  };

  const getClassroomAssignments = async (classroomId) => {
    try {
      return await request(`/classrooms/${classroomId}/assignments`);
    } catch (_) {
      return [];
    }
  };

  /* ---------- Branch Operations ---------- */
  const getBranches = async (owner, repo) => {
    return request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches`);
  };

  /* ---------- Collaborators (Teacher) ---------- */
  const getCollaborators = async (owner, repo) => {
    return request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/collaborators`);
  };

  /* ---------- Search ---------- */
  const searchRepos = async (query) => {
    return request(`/search/repositories?q=${encodeURIComponent(query)}&per_page=20`);
  };

  /* ---------- Upload binary/base64 content ---------- */
  const uploadFile = async (owner, repo, filePath, base64Content, commitMessage) => {
    let sha = null;
    try {
      const existing = await getFileContents(owner, repo, filePath);
      sha = existing.sha;
    } catch (_) {}

    const body = { message: commitMessage || `Upload ${filePath}`, content: base64Content };
    if (sha) body.sha = sha;

    return request(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(filePath)}`,
      { method: 'PUT', body: JSON.stringify(body) }
    );
  };

  return {
    setToken, getToken, clearToken,
    getUser, getCurrentUser,
    getOrgs, getUserRepos, getOrgRepos, getRepo,
    getFileContents, getRepoTree,
    createOrUpdateFile, saveFile, uploadFile,
    getCommits, getBranches, getCollaborators,
    getClassrooms, getClassroomAssignments,
    searchRepos,
  };
})();
