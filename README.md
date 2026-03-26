# 🤖 Robotics Classroom Program

A polished, browser-based coding environment for high-school introductory robotics courses.  
**No installation. No admin passwords. No server required.** Just open `index.html` in any browser.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🧩 **Visual Blockly Editor** | Drag-and-drop blocks with simplified, student-friendly Dobot commands |
| 🐍 **Python Editor** | Full-featured Monaco editor (VS Code engine) with syntax highlighting |
| ⚡ **Event Sheet** | "When [Event] → Do [Action]" visual programming like Construct/GDevelop |
| 🤖 **Robot Simulator** | On-screen animated robot arm to visualize programs before running |
| 🔗 **GitHub Classroom** | Auto-pull assignments, save & push code — all via GitHub API |
| 👩‍🏫 **Teacher Dashboard** | View all student repos, track progress, open any student's code |
| 🎮 **VEX Upload** | Drag & drop VEX blocks or Python files directly to GitHub repos |
| 🧠 **AI Robot Blocks** | Color detection, object detection, face detection, line-following |

---

## 🚀 Getting Started (Students)

### Step 1 — Open the App

**Option A (Recommended):** Double-click `index.html` to open it in your browser.  
**Option B:** Open any browser and go to `File → Open File → index.html`.

> 💡 No download, no installation, no admin password needed!

### Step 2 — Get a GitHub Token

1. Go to [github.com/settings/tokens/new](https://github.com/settings/tokens/new?scopes=repo,read:org&description=Robotics+Classroom)
2. Give it a name like **"Robotics Class"**
3. Check **`repo`** and **`read:org`** scopes
4. Click **Generate token** and copy the token (starts with `ghp_`)

### Step 3 — Sign In

1. Paste your token into the login screen
2. Select **Student** or **Teacher** role
3. Click **Connect & Enter** 🚀

---

## 💻 Using the Code Editor

The editor has **three coding modes** — switch between them with the tabs at the top:

### 🧩 Visual Blocks (Blockly)
- Drag blocks from the left panel into the workspace
- Categories: **Movement, Gripper, Speed, Actions, AI Features, VEX Robot, Control, Numbers**
- Click **Generate Python** to convert your blocks to Python code

### 🐍 Python Code
- Full Python editor powered by Monaco (VS Code engine)
- Syntax highlighting, autocomplete, and line numbers
- Press **Ctrl+S** to save directly to GitHub

### ⚡ Event Sheet
- Click **Add Event** to choose what triggers your code (button press, timer, AI detection…)
- Click **Add Action** to choose what the robot does
- Click **Generate Python** to see the equivalent Python code

---

## 🤖 Supported Robots

| Robot | Blocks | Python | AI Features |
|---|---|---|---|
| **Dobot Magician** | ✅ | ✅ | ➖ |
| **Dobot AI Starter** | ✅ | ✅ | ✅ Color, Object, Face, Line |
| **Dobot Magician + AI Kit** | ✅ | ✅ | ✅ Full AI suite |
| **VEX IQ / V5** | ✅ | ✅ | ➖ |

### Simplified Robot Commands (for beginners)

Instead of complex coordinate commands, students use plain-English blocks:

| Block | What it does |
|---|---|
| `Move Forward 50 mm` | Move the arm toward you |
| `Move Up 20 mm` | Raise the arm |
| `Grab (Suction ON)` | Pick up an object using suction |
| `Release` | Let go of the object |
| `Set Speed: Slow` | Make movements slow and safe |
| `Wait 1 seconds` | Pause before the next step |
| `AI: Detect Color` | Use the camera to see what color an object is |

---

## 🔗 GitHub Classroom Integration

### Students
- **View assignments** on the Dashboard — all your GitHub repos appear automatically
- **Open a repo** → browse files → open and edit code
- **Save with Ctrl+S** → your code is pushed to GitHub instantly
- **No git commands needed** — everything is automatic

### Teachers  
- Switch to **Teacher role** when logging in
- Go to **Student Progress** to select your classroom (GitHub Organization)
- See all student repos, last-updated time, and open any repo to review code
- Click **View Code** on any student to open their repo in the editor

---

## 🎮 VEX Upload

1. Go to **VEX Upload** in the sidebar
2. Enter the target repository (`username/repo-name`)
3. Drag & drop your VEX file (`.vex`, `.v5python`, `.py`)
4. Click **Upload to GitHub** — done!

Supported VEX file types: `.vex`, `.v5python`, `.py`, `.txt`, `.xml`

---

## 🐍 Running Code on a Real Robot

The visual editor generates Python code you can run on a real Dobot in two ways:

### Option A — Local Bridge (Recommended): Run from the Browser

The **Local Bridge** lets you click a button in the web IDE and have code execute on the robot immediately — no terminal required.

#### Step 1 — Install bridge dependencies
```bash
pip install -r requirements-bridge.txt
# or manually:
pip install flask flask-socketio pydobot pyserial
```

#### Step 2 — Start the bridge
```bash
python bridge.py
```
You should see:
```
====================================================
  Robotics Classroom — Local Bridge
  Listening on  http://127.0.0.1:5000
  Press Ctrl+C to stop
====================================================
```

#### Step 3 — Connect from the IDE
1. Open the IDE and navigate to the **Editor** view.
2. Click **🔌 Connect to Bridge** in the toolbar.
3. The button turns green when connected.
4. Write or generate your Python code.
5. Click **🤖 Run on Robot** — output streams live into the **Robot Terminal** panel.

> **⏹ Stop:** Click the **Stop** button in the terminal header to terminate the program at any time.

#### Browser compatibility note
The bridge connects via `ws://127.0.0.1:5000` even when the IDE is served from an HTTPS host like GitHub Pages. Modern browsers permit this because `127.0.0.1` is treated as a *secure context*:

- **Chrome 94+ / Edge**: Allowed. The bridge also sends `Access-Control-Allow-Private-Network: true` to satisfy Chrome's Private Network Access preflight.
- **Firefox**: Allowed — no special action needed.
- **Safari**: May block. Enable **Develop → Disable Cross-Origin Restrictions** in Safari's menu bar, or open the IDE locally over HTTP.

---

### Option B — Manual: Download and Run in Terminal

Save your `.py` file from the editor and run it:
```bash
pip install pydobot
python my_program.py
```

> If no robot is connected, the wrapper runs in **simulation mode** and prints every command — great for testing at home!

### Requirements for real robot
- Windows 10/11 (Dobot USB driver)
- Python 3.8+
- `pip install pydobot pyserial`
- Dobot Magician USB cable connected

---

## 📁 Project Structure

```
robotics-github-classroom-program/
├── index.html              ← Open this in your browser!
├── bridge.py               ← Local Python bridge server (run to control real robot)
├── requirements-bridge.txt ← Python deps for bridge.py
├── css/
│   └── styles.css          ← All styling
├── js/
│   ├── app.js              ← Main application controller
│   ├── bridge.js           ← Local bridge WebSocket client
│   ├── github-api.js       ← GitHub API integration
│   ├── blockly-setup.js    ← Blockly + Dobot custom blocks
│   ├── event-sheet.js      ← Event sheet coding interface
│   └── robot-simulator.js  ← On-screen robot simulator
├── dobot_wrapper/
│   ├── __init__.py         ← Python package entry point
│   └── robot.py            ← DobotRobot class (simplified API)
└── examples/
    ├── 01_basic_movements.py
    ├── 02_pick_and_place_loop.py
    ├── 03_ai_color_sorting.py
    └── 04_vex_basic_drive.py
```

---

## 🔒 Security & Privacy

- Your GitHub token is stored **only in your browser's localStorage** — never sent to any server
- All GitHub API calls go directly from your browser to `api.github.com`
- **The local bridge never receives GitHub tokens** — it only receives Python code for execution
- The bridge binds to `127.0.0.1` only — not accessible from outside your computer
- No data is collected or stored anywhere else

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| Blockly doesn't load | Check internet connection (needed to load Blockly from CDN) |
| "Login Failed" | Check your GitHub token has `repo` scope |
| Can't see assignments | Make sure you're a member of the GitHub Classroom organization |
| Monaco editor not loading | Check internet connection; a fallback text editor will be used instead |
| File not saving | Make sure your token has `repo` (write) permission |
| "Bridge Not Found" | Make sure `python bridge.py` is running on your computer |
| Bridge connects but robot doesn't move | Check the COM port in Settings matches your robot's actual port |
| Bridge works on Chrome but not Safari | Enable Develop → Disable Cross-Origin Restrictions in Safari |

---

## 📚 Example Programs

See the [`examples/`](examples/) folder:

- **01_basic_movements.py** — Introduction to robot movements
- **02_pick_and_place_loop.py** — Using loops to move multiple objects
- **03_ai_color_sorting.py** — AI-powered color detection and sorting
- **04_vex_basic_drive.py** — VEX V5 driving in a square

---

## 🏫 For Teachers — Setting Up GitHub Classroom

1. Create a **GitHub Organization** for your class (e.g., `mr-smith-robotics-2025`)
2. Go to [classroom.github.com](https://classroom.github.com) and create a classroom
3. Create **assignments** — each student gets their own repo automatically
4. Students use this app to log in, see their repos, and code right away
5. Teachers can monitor all student repos from the **Student Progress** dashboard

---

*Built for introductory robotics — simple enough for day one, powerful enough for advanced projects.*
