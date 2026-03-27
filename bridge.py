#!/usr/bin/env python3
"""
Local WebServer Bridge — Robotics Classroom Program
====================================================
Run this script on the same computer the Dobot is plugged into.
The browser IDE will connect via WebSocket and send Python code to execute.

Usage
-----
  pip install flask flask-socketio
  python bridge.py

Then open the web IDE and click "Connect to Bridge".

Security notes
--------------
* Only binds to 127.0.0.1 (localhost) — not reachable from outside your PC.
* Does NOT receive, store, or forward GitHub tokens.
* Code is executed with the same OS user privileges as this script.
  Only run code that you have written yourself.
"""

import os
import sys
import subprocess
import tempfile
import threading

from flask import Flask
from flask_socketio import SocketIO, emit

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)

socketio = SocketIO(
    app,
    cors_allowed_origins='*',       # Required so GitHub Pages (HTTPS) can connect
    async_mode='threading',
    logger=False,
    engineio_logger=False,
)

# Track the currently running subprocess so we can terminate it on request.
_running_proc = None
_proc_lock = threading.Lock()


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

@app.after_request
def _add_cors_headers(response):
    """
    Allow cross-origin requests from an HTTPS GitHub Pages host.

    Chrome's Private Network Access policy blocks HTTPS→localhost requests
    unless the server explicitly opts in via these headers.
    """
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Private-Network'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = (
        'Content-Type, Access-Control-Request-Private-Network'
    )
    return response


@app.route('/health')
def health():
    """Simple health-check endpoint so the UI can detect the bridge."""
    return {'status': 'ok', 'bridge': 'robotics-classroom'}


# ---------------------------------------------------------------------------
# WebSocket events
# ---------------------------------------------------------------------------

@socketio.on('connect')
def on_connect():
    emit('status', {'connected': True, 'message': 'Bridge ready'})
    print('[bridge] Client connected')


@socketio.on('disconnect')
def on_disconnect():
    print('[bridge] Client disconnected')


@socketio.on('ping')
def on_ping():
    emit('pong', {'ok': True})


@socketio.on('run_code')
def on_run_code(data):
    """
    Receive a Python code string from the browser, write it to a temporary
    file, execute it in a subprocess, and stream stdout/stderr back.
    """
    global _running_proc

    code = data.get('code', '').strip()
    port = data.get('port', 'COM3')

    if not code:
        emit('output', {'stream': 'stderr', 'data': 'No code received.\n'})
        emit('done', {'returncode': 1})
        return

    # Directory where bridge.py (and dobot_wrapper/) lives.  We add it to
    # PYTHONPATH so the subprocess can ``from dobot_wrapper import …`` even
    # though the temp script is written to the OS temp directory.
    bridge_dir = os.path.dirname(os.path.abspath(__file__))

    # Pass the configured serial port to the child process via the environment
    # so dobot_wrapper can find it without the user having to edit the code.
    env = os.environ.copy()
    env['DOBOT_DEFAULT_PORT'] = port

    # Prepend the bridge directory so dobot_wrapper is importable.
    existing = env.get('PYTHONPATH', '')
    env['PYTHONPATH'] = bridge_dir + (os.pathsep + existing if existing else '')

    # Write code to a temp file instead of using -c to avoid quoting problems
    # with multi-line code and to give the subprocess a proper __file__ path.
    try:
        tmp = tempfile.NamedTemporaryFile(
            mode='w', suffix='.py', delete=False, encoding='utf-8'
        )
        tmp.write(code)
        tmp_path = tmp.name
        tmp.close()
    except OSError as exc:
        emit('output', {'stream': 'stderr', 'data': f'Could not write temp file: {exc}\n'})
        emit('done', {'returncode': 1})
        return

    emit('output', {'stream': 'info', 'data': '▶ Running program...\n'})

    def _stream():
        global _running_proc
        returncode = 1
        try:
            proc = subprocess.Popen(
                [sys.executable, tmp_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                env=env,
                cwd=bridge_dir,
            )
            with _proc_lock:
                _running_proc = proc

            def _read_pipe(pipe, stream_name):
                for line in iter(pipe.readline, ''):
                    socketio.emit('output', {'stream': stream_name, 'data': line})
                pipe.close()

            t_out = threading.Thread(
                target=_read_pipe, args=(proc.stdout, 'stdout'), daemon=True
            )
            t_err = threading.Thread(
                target=_read_pipe, args=(proc.stderr, 'stderr'), daemon=True
            )
            t_out.start()
            t_err.start()
            t_out.join()
            t_err.join()

            proc.wait()
            returncode = proc.returncode

        except Exception as exc:
            socketio.emit('output', {'stream': 'stderr', 'data': f'Bridge error: {exc}\n'})

        finally:
            with _proc_lock:
                _running_proc = None
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
            socketio.emit('done', {'returncode': returncode})

    threading.Thread(target=_stream, daemon=True).start()


@socketio.on('stop_code')
def on_stop_code():
    """Terminate the currently running subprocess."""
    _stop_running()
    emit('output', {'stream': 'info', 'data': '⏹ Stopped by user.\n'})
    emit('done', {'returncode': -15})    # -15 matches SIGTERM convention


def _stop_running():
    global _running_proc
    with _proc_lock:
        if _running_proc and _running_proc.poll() is None:
            _running_proc.terminate()
            try:
                _running_proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                _running_proc.kill()
            _running_proc = None


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    print('=' * 52)
    print('  Robotics Classroom — Local Bridge')
    print('  Listening on  http://127.0.0.1:5000')
    print('  Press Ctrl+C to stop')
    print('=' * 52)
    socketio.run(app, host='127.0.0.1', port=5000, debug=False)
