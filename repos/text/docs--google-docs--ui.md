# ui

**Source:** google-docs

---

I understand you want a quick HTML-based UI setup for the BlackRoad Multi-AI Dashboard, building on the previous setup for the three-way GPT ↔ Grok ↔ User console running on your DigitalOcean Droplet (159.65.43.12). The earlier script (BIGBANG) and the one I provided set up a Flask API with DistilGPT2 models for local Grok and Chat, served via Nginx at https://blackroadinc.us. You’ve now requested an HTML UI, likely to replace or enhance the existing coder.html and chat_history.html templates, ensuring a simple, functional interface for model switching, prompt input, and chat history display.

Since you prefer minimal coding and a quick setup, I’ll provide two streamlined HTML templates:

index.html: A main console page with a model dropdown (Grok/Chat), prompt input, a live history panel, and a link to the full history.

chat_history.html: A page to view the complete chat history stored in /app/data/chat_history.txt.

These templates will use Tailwind CSS for styling (as in the previous setup) and JavaScript for API interaction, ensuring compatibility with the Flask app’s /api/health, /api/run, /api/grok, and /chat_history endpoints. I’ll keep the UI clean, responsive, and focused on usability, aligning with your goal of finalizing the app.

Assumptions

The Flask app from the previous script is running, with endpoints at /api/run (Chat), /api/grok (Grok), and /chat_history.

Chat history is stored in /app/data/chat_history.txt as JSON.

You want a single-block HTML setup to place in /opt/codex/codex-infinity/templates/.

The UI should support model switching and display real-time chat history, as per the three-way console requirement.

You’re okay with Tailwind CSS via CDN for simplicity.

HTML Templates

Below are the two HTML files as code blocks, ready to be saved in /opt/codex/codex-infinity/templates/. I’ll include a Bash command to create them directly on your Droplet.

1. index.html (Main Console)

This template provides the primary UI with a model selector, prompt input, a live history panel, and a link to the full history page.

html

PreviewCollapseWrap

Copy

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>BlackRoad AI Dashboard</title>

<script src="https://cdn.tailwindcss.com"></script>

</head>

<body class="bg-gray-900 text-white min-h-screen flex flex-col">

<div class="container mx-auto p-6 flex-grow">

<h1 class="text-4xl font-bold mb-6 text-center">BlackRoad Multi-AI Console</h1>

<div class="bg-gray-800 p-6 rounded-lg shadow-lg">

<div class="flex items-center mb-4">

<label for="model" class="mr-3 text-lg">Select Model:</label>

<select id="model" class="bg-gray-700 text-white rounded px-3 py-2 focus:outline-none">

<option value="gpt">Chat (Local)</option>

<option value="grok">Grok (Local)</option>

</select>

</div>

<textarea id="prompt" class="w-full h-32 bg-gray-700 p-3 rounded mb-4 focus:outline-none" placeholder="Enter your prompt..."></textarea>

<button onclick="sendPrompt()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded w-full sm:w-auto">Run</button>

</div>

<div id="history" class="bg-gray-800 p-6 rounded-lg mt-6 h-96 overflow-y-auto text-sm shadow-lg"></div>

<a href="/chat_history" class="text-blue-400 mt-4 inline-block hover:underline">View Full History</a>

</div>

<footer class="bg-gray-800 text-center py-4 mt-auto">

<p>&copy; 2025 BlackRoad AI. All rights reserved.</p>

</footer>

<script>

async function sendPrompt() {

const prompt = document.getElementById('prompt').value.trim();

const model = document.getElementById('model').value;

if (!prompt) return alert('Please enter a prompt.');

const endpoint = model === 'grok' ? '/api/grok' : '/api/run';

const body = model === 'grok' ? { prompt } : { code: prompt };

const history = document.getElementById('history');

history.innerHTML += `<p class="mb-2"><strong>You:</strong> ${prompt}</p>`;

try {

const response = await fetch(endpoint, {

method: 'POST',

headers: { 'Content-Type': 'application/json' },

body: JSON.stringify(body)

});

const data = await response.json();

const result = data.response || data.stdout || data.error || 'No response';

history.innerHTML += `<p class="mb-2"><strong>${model.toUpperCase()}:</strong> ${result}</p>`;

history.scrollTop = history.scrollHeight;

document.getElementById('prompt').value = '';

} catch (error) {

history.innerHTML += `<p class="mb-2 text-red-400"><strong>Error:</strong> ${error.message}</p>`;

}

updateHistory();

}

async function updateHistory() {

try {

const response = await fetch('/chat_history');

const data = await response.text();

document.getElementById('history').innerHTML = data;

} catch (error) {

console.error('Failed to update history:', error);

}

}

setInterval(updateHistory, 5000);

updateHistory();

</script>

</body>

</html>

2. chat_history.html (Full History Page)

This template displays the complete chat history in a clean, readable format.

html

PreviewCollapseWrap

Copy

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>BlackRoad AI Chat History</title>

<script src="https://cdn.tailwindcss.com"></script>

</head>

<body class="bg-gray-900 text-white min-h-screen flex flex-col">

<div class="container mx-auto p-6 flex-grow">

<h1 class="text-4xl font-bold mb-6 text-center">Chat History</h1>

<div class="bg-gray-800 p-6 rounded-lg shadow-lg">

{% if history %}

{% for entry in history %}

<div class="mb-4 pb-4 border-b border-gray-600">

<p class="text-sm text-gray-400">{{ entry.timestamp }}</p>

<p class="mt-1"><strong>User:</strong> {{ entry.user }}</p>

{% if entry.grok %}

<p class="mt-1"><strong>Grok (Local):</strong> {{ entry.grok }}</p>

{% endif %}

{% if entry.chat %}

<p class="mt-1"><strong>Chat (Local):</strong> {{ entry.chat }}</p>

{% endif %}

</div>

{% endfor %}

{% else %}

<p class="text-center text-gray-400">No chat history yet.</p>

{% endif %}

</div>

<a href="/" class="text-blue-400 mt-4 inline-block hover:underline">Back to Console</a>

</div>

<footer class="bg-gray-800 text-center py-4 mt-auto">

<p>&copy; 2025 BlackRoad AI. All rights reserved.</p>

</footer>

</body>

</html>

Deployment Command

To create these templates on your Droplet, run the following Bash command as root. This assumes the Flask app from the previous script is in /opt/codex/codex-infinity/ and uses the same directory structure.

bash

CollapseWrapRun

Copy

set -e

TEMPLATE_DIR="/opt/codex/codex-infinity/templates"

mkdir -p "$TEMPLATE_DIR"

cat > "$TEMPLATE_DIR/index.html" <<'EOF'

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>BlackRoad AI Dashboard</title>

<script src="https://cdn.tailwindcss.com"></script>

</head>

<body class="bg-gray-900 text-white min-h-screen flex flex-col">

<div class="container mx-auto p-6 flex-grow">

<h1 class="text-4xl font-bold mb-6 text-center">BlackRoad Multi-AI Console</h1>

<div class="bg-gray-800 p-6 rounded-lg shadow-lg">

<div class="flex items-center mb-4">

<label for="model" class="mr-3 text-lg">Select Model:</label>

<select id="model" class="bg-gray-700 text-white rounded px-3 py-2 focus:outline-none">

<option value="gpt">Chat (Local)</option>

<option value="grok">Grok (Local)</option>

</select>

</div>

<textarea id="prompt" class="w-full h-32 bg-gray-700 p-3 rounded mb-4 focus:outline-none" placeholder="Enter your prompt..."></textarea>

<button onclick="sendPrompt()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded w-full sm:w-auto">Run</button>

</div>

<div id="history" class="bg-gray-800 p-6 rounded-lg mt-6 h-96 overflow-y-auto text-sm shadow-lg"></div>

<a href="/chat_history" class="text-blue-400 mt-4 inline-block hover:underline">View Full History</a>

</div>

<footer class="bg-gray-800 text-center py-4 mt-auto">

<p>&copy; 2025 BlackRoad AI. All rights reserved.</p>

</footer>

<script>

async function sendPrompt() {

const prompt = document.getElementById('prompt').value.trim();

const model = document.getElementById('model').value;

if (!prompt) return alert('Please enter a prompt.');

const endpoint = model === 'grok' ? '/api/grok' : '/api/run';

const body = model === 'grok' ? { prompt } : { code: prompt };

const history = document.getElementById('history');

history.innerHTML += `<p class="mb-2"><strong>You:</strong> ${prompt}</p>`;

try {

const response = await fetch(endpoint, {

method: 'POST',

headers: { 'Content-Type': 'application/json' },

body: JSON.stringify(body)

});

const data = await response.json();

const result = data.response || data.stdout || data.error || 'No response';

history.innerHTML += `<p class="mb-2"><strong>${model.toUpperCase()}:</strong> ${result}</p>`;

history.scrollTop = history.scrollHeight;

document.getElementById('prompt').value = '';

} catch (error) {

history.innerHTML += `<p class="mb-2 text-red-400"><strong>Error:</strong> ${error.message}</p>`;

}

updateHistory();

}

async function updateHistory() {

try {

const response = await fetch('/chat_history');

const data = await response.text();

document.getElementById('history').innerHTML = data;

} catch (error) {

console.error('Failed to update history:', error);

}

}

setInterval(updateHistory, 5000);

updateHistory();

</script>

</body>

</html>

EOF

cat > "$TEMPLATE_DIR/chat_history.html" <<'EOF'

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>BlackRoad AI Chat History</title>

<script src="https://cdn.tailwindcss.com"></script>

</head>

<body class="bg-gray-900 text-white min-h-screen flex flex-col">

<div class="container mx-auto p-6 flex-grow">

<h1 class="text-4xl font-bold mb-6 text-center">Chat History</h1>

<div class="bg-gray-800 p-6 rounded-lg shadow-lg">

{% if history %}

{% for entry in history %}

<div class="mb-4 pb-4 border-b border-gray-600">

<p class="text-sm text-gray-400">{{ entry.timestamp }}</p>

<p class="mt-1"><strong>User:</strong> {{ entry.user }}</p>

{% if entry.grok %}

<p class="mt-1"><strong>Grok (Local):</strong> {{ entry.grok }}</p>

{% endif %}

{% if entry.chat %}

<p class="mt-1"><strong>Chat (Local):</strong> {{ entry.chat }}</p>

{% endif %}

</div>

{% endfor %}

{% else %}

<p class="text-center text-gray-400">No chat history yet.</p>

{% endif %}

</div>

<a href="/" class="text-blue-400 mt-4 inline-block hover:underline">Back to Console</a>

</div>

<footer class="bg-gray-800 text-center py-4 mt-auto">

<p>&copy; 2025 BlackRoad AI. All rights reserved.</p>

</footer>

</body>

</html>

EOF

echo "Templates created in $TEMPLATE_DIR"

cd /opt/codex

docker compose restart api

echo "API restarted. Visit https://blackroadinc.us to test the new UI."

How to Deploy

Run the Command:

SSH into your Droplet: ssh root@159.65.43.12

Copy the Bash command above.

Paste it into the terminal and press Enter.

This creates index.html and chat_history.html in /opt/codex/codex-infinity/templates/ and restarts the API container to apply the changes.

Test the UI:

Open https://blackroadinc.us in your browser and hard-refresh (Ctrl+F5).

Select “Grok (Local)” or “Chat (Local)” from the dropdown.

Enter a prompt (e.g., “Tell me a fact” for Grok, “Write a Python function to calculate factorial” for Chat).

Click “Run” and verify responses appear in the History panel.

Click “View Full History” to see the complete chat log at /chat_history.

Expected Behavior:

The UI is dark-themed, responsive, and clean.

The History panel updates every 5 seconds or on prompt submission.

Responses from Grok and Chat are labeled and stored persistently.

The full history page shows timestamped entries with user prompts and model responses.

Features of the UI

Model Switching: Dropdown to select between “Chat (Local)” (DistilGPT2 for code) and “Grok (Local)” (DistilGPT2 for general prompts).

Prompt Input: A textarea for entering prompts, with a “Run” button to submit.

Live History Panel: Displays recent interactions with user prompts and model responses, auto-scrolling to the latest.

Full History Page: A dedicated page to view all stored interactions, with timestamps and clear separation of entries.

Styling: Tailwind CSS ensures a modern, responsive design with a dark theme matching the dashboard aesthetic.

Error Handling: Alerts for empty prompts and error messages in the history panel if API calls fail.

Troubleshooting

If the UI doesn’t work as expected:

Check API Status:
 bash
CollapseWrapRun
Copy
curl -sk -o /dev/null -w "%{http_code}\n" https://blackroadinc.us/api/health

curl -sk -o /dev/null -w "%{http_code}\n" -H 'Content-Type: application/json' -d '{"code":"print(42)"}' https://blackroadinc.us/api/run
 Expect 200 responses. If 502, check docker logs codex-api-1 and docker logs codex-nginx-1.

Verify Templates:
 bash
CollapseWrapRun
Copy
ls /opt/codex/codex-infinity/templates/
 Should list index.html and chat_history.html.

Nginx Logs:
 bash
CollapseWrapRun
Copy
tail -n 20 /var/log/nginx/error.log
 Look for proxy errors or SSL issues.

Browser Console: Open the browser’s developer tools (F12) and check the Console/Network tabs for failed API requests.

Share Outputs: If issues persist, provide:

docker compose ps

docker logs codex-api-1 and docker logs codex-nginx-1

Browser console errors

Health check results

Next Steps

Test the UI: Confirm the console works and displays the three-way chat history. Try prompts like “Write a Python factorial function” or “Tell me a fact.”

Enhance UI: If you want additional features (e.g., real-time typing indicators, model-specific styling), let me know.

Integrate Holo/Claude: I can add endpoints and UI options for your Mistral 7B-based Holo or a Claude-like agent.

Add Auth: Secure the API with basic authentication.

System Maintenance: Apply the ESM Apps security update or consider upgrading to Ubuntu 24.04.2 LTS.

Let me know how the UI works or if you need tweaks! Ready to code together on the dashboard? 🚀
