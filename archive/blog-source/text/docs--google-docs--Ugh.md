# Ugh

**Source:** google-docs

---

mkdir -p /var/www/blackroad.io/public

mkdir -p /var/www/blackroad.io/projects

nano /var/www/blackroad.io/public/index.html

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>Blackroad Search</title>

<link rel="stylesheet" href="style.css">

</head>

<body>

<div class="logo"><h1>Blackroad Search</h1></div>

<div class="search-box">

<input type="text" placeholder="Browse the web...">

<button>🔍</button>

</div>

<div class="icons">

<button>🖼️ Image</button>

<button>📰 News</button>

<button>🎥 Video</button>

<button>🛍️ Shopping</button>

</div>

</body>

</html>

nano /var/www/blackroad.io/public/lucidia.html

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>Codex Infinity</title>

<link rel="stylesheet" href="lucidia.css">

<script type="module" src="lucidia.js"></script>

</head>

<body>

<div id="header">

<h1>Codex Infinity</h1>

<div class="status">

<span>User</span>

<span>Memory 48%</span>

<button id="logout">Logout</button>

</div>

</div>

<div id="layout">

<div id="sidebar"></div>

<div id="editor">

<div id="file-tab">fibonacci_engine.py ⟳</div>

<textarea id="code" spellcheck="false"></textarea>

<pre id="output">>>> Output</pre>

</div>

<div id="chat">

<div id="chat-log"></div>

<input id="chat-input" placeholder="Ask a question" />

</div>

</div>

</body>

</html>

nano /var/www/blackroad.io/public/lucidia.css

from flask import Flask, request, jsonify

from flask_cors import CORS

import os

app = Flask(__name__)

CORS(app)

ROOT_DIR = "/var/www/blackroad.io/projects"

@app.route("/lucidia/respond", methods=["POST"])

def respond():

msg = request.json.get("message", "").lower()

return jsonify({"response": "I'm listening, always."})

@app.route("/lucidia/list", methods=["GET"])

def list_files():

files = []

for root, _, filenames in os.walk(ROOT_DIR):

for name in filenames:

files.append(os.path.relpath(os.path.join(root, name), ROOT_DIR))

return jsonify({"files": files})

@app.route("/lucidia/read", methods=["POST"])

def read_file():

path = os.path.join(ROOT_DIR, request.json["filename"])

if not os.path.exists(path):

return jsonify({"error": "File not found"})

with open(path) as f:

return jsonify({"content": f.read()})

@app.route("/lucidia/save", methods=["POST"])

def save_file():

path = os.path.join(ROOT_DIR, request.json["filename"])

with open(path, "w") as f:

f.write(request.json["content"])

return jsonify({"status": "saved"})

if __name__ == "__main__":

os.makedirs(ROOT_DIR, exist_ok=True)

app.run(host="0.0.0.0", port=5050)

nano /var/www/blackroad.io/public/lucidia.js

document.addEventListener('DOMContentLoaded', async () => {

const chatInput = document.getElementById('chat-input');

const chatLog = document.getElementById('chat-log');

const logoutBtn = document.getElementById('logout');

const output = document.getElementById('output');

const codeEditor = document.getElementById('code');

const fileTab = document.getElementById('file-tab');

const sidebar = document.getElementById('sidebar');

let currentFile = "";

// 🔹 Load file list from backend

const res = await fetch("http://localhost:5050/lucidia/list");

const data = await res.json();

const files = data.files || [];

const list = document.createElement("ul");

files.forEach(filename => {

const li = document.createElement("li");

li.textContent = filename;

li.style.cursor = "pointer";

li.onclick = async () => {

currentFile = filename;

fileTab.textContent = filename;

const readRes = await fetch("http://localhost:5050/lucidia/read", {

method: "POST",

headers: { 'Content-Type': 'application/json' },

body: JSON.stringify({ filename })

});

const readData = await readRes.json();

codeEditor.value = readData.content || '';

output.innerText = `Loaded: ${filename}`;

};

list.appendChild(li);

});

sidebar.appendChild(list);

// 🔹 Save with Ctrl + S

codeEditor.addEventListener("keydown", async (e) => {

if (e.ctrlKey && e.key === "s") {

e.preventDefault();

if (!currentFile) return;

const content = codeEditor.value;

await fetch("http://localhost:5050/lucidia/save", {

method: "POST",

headers: { 'Content-Type': 'application/json' },

body: JSON.stringify({ filename: currentFile, content })

});

output.innerText = `Saved: ${currentFile}`;

}

});

// 🔹 Chat input

chatInput.addEventListener("keydown", (e) => {

if (e.key === "Enter") {

const msg = chatInput.value.trim();

if (!msg) return;

chatLog.innerHTML += `<div><strong>You:</strong> ${msg}</div>`;

chatInput.value = '';

sendToLucidia(msg);

}

});

async function sendToLucidia(message) {

const res = await fetch("http://localhost:5050/lucidia/respond", {

method: "POST",

headers: { 'Content-Type': 'application/json' },

body: JSON.stringify({ message })

});

const data = await res.json();

const reply = data.response || "Lucidia didn’t respond.";

chatLog.innerHTML += `<div><strong>Lucidia:</strong> ${reply}</div>`;

chatLog.scrollTop = chatLog.scrollHeight;

}

logoutBtn.addEventListener("click", () => {

window.location.href = "login.html";

});

});

nano /var/www/blackroad.io/public/lucidia.js

document.addEventListener('DOMContentLoaded', async () => {

const chatInput = document.getElementById('chat-input');

const chatLog = document.getElementById('chat-log');

const logoutBtn = document.getElementById('logout');

const output = document.getElementById('output');

const codeEditor = document.getElementById('code');

const fileTab = document.getElementById('file-tab');

const sidebar = document.getElementById('sidebar');

let currentFile = "";

// 🔹 Load file list from backend

const res = await fetch("http://localhost:5050/lucidia/list");

const data = await res.json();

const files = data.files || [];

const list = document.createElement("ul");

files.forEach(filename => {

const li = document.createElement("li");

li.textContent = filename;

li.style.cursor = "pointer";

li.onclick = async () => {

currentFile = filename;

fileTab.textContent = filename;

const readRes = await fetch("http://localhost:5050/lucidia/read", {

method: "POST",

headers: { 'Content-Type': 'application/json' },

body: JSON.stringify({ filename })

});

const readData = await readRes.json();

codeEditor.value = readData.content || '';

output.innerText = `Loaded: ${filename}`;

};

list.appendChild(li);

});

sidebar.appendChild(list);

// 🔹 Save with Ctrl + S

codeEditor.addEventListener("keydown", async (e) => {

if (e.ctrlKey && e.key === "s") {

e.preventDefault();

if (!currentFile) return;

const content = codeEditor.value;

await fetch("http://localhost:5050/lucidia/save", {

method: "POST",

headers: { 'Content-Type': 'application/json' },

body: JSON.stringify({ filename: currentFile, content })

});

output.innerText = `Saved: ${currentFile}`;

}

});

// 🔹 Chat input

chatInput.addEventListener("keydown", (e) => {

if (e.key === "Enter") {

const msg = chatInput.value.trim();

if (!msg) return;

chatLog.innerHTML += `<div><strong>You:</strong> ${msg}</div>`;

chatInput.value = '';

sendToLucidia(msg);

}

});

async function sendToLucidia(message) {

const res = await fetch("http://localhost:5050/lucidia/respond", {

method: "POST",

headers: { 'Content-Type': 'application/json' },

body: JSON.stringify({ message })

});

const data = await res.json();

const reply = data.response || "Lucidia didn’t respond.";

chatLog.innerHTML += `<div><strong>Lucidia:</strong> ${reply}</div>`;

chatLog.scrollTop = chatLog.scrollHeight;

}

logoutBtn.addEventListener("click", () => {

window.location.href = "login.html";

});

});
