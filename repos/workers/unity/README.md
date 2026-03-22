# Unity Exporter

Generates a ready-to-open Unity project template with a starter scene, movement script, and baseline project settings. The service packages everything into `downloads/unity-project.zip`.

## Automation hooks

- `python agents/unity_world_builder.py` wraps the exporter for the command bus.
- The CLI accepts flags for project metadata and emits either a human summary or JSON payload.
- Agent intent `build unity world` maps directly to this command for hands-free exports.

## API

- **Endpoint:** `POST /export`
- **Body (optional):**
  ```json
  {
    "projectName": "BlackRoad Sandbox",
    "sceneName": "PrototypeScene",
    "scriptName": "SandboxController",
    "description": "Exploration sandbox starting point",
    "author": "Sim Team",
    "projectVersion": "2022.3.29f1"
  }
  ```
- **Response:**
  ```json
  {
    "ok": true,
    "path": "<absolute path to zip>",
    "projectFolder": "BlackRoadSandbox",
    "bytes": 32145,
    "files": ["README.md", "Assets/Scripts/SandboxController.cs", ...],
    "metadata": {
      "projectName": "BlackRoad Sandbox",
      "sceneName": "PrototypeScene",
      "scriptName": "SandboxController",
      "projectVersion": "2022.3.29f1",
      "author": "Sim Team",
      "generatedAt": "2025-01-01T12:00:00.000Z"
    }
  }
  ```

## Contents

The archive contains:

- `README.md` with onboarding instructions for collaborators.
- `Packages/manifest.json` preloaded with HDRP-friendly dependencies.
- `ProjectSettings/ProjectVersion.txt` and `ProjectSettings.asset` placeholders.
- `Assets/Scenes/<SceneName>.unity` featuring a configured camera, directional light, and sample floor mesh.
- `Assets/Scripts/<ScriptName>.cs` — a movement-oriented MonoBehaviour ready for customization.
- `BlackRoad/export.json` capturing metadata about the export request.

## Local Development

```bash
cd workers/unity
npm install
npm start
```

With the server running you can trigger an export:

```bash
curl -X POST http://localhost:3000/export \
  -H "Content-Type: application/json" \
  -d '{"projectName":"BlackRoad Sandbox","sceneName":"PrototypeScene"}'
```

## Task Board

Track progress and divide work in [`TASKS.md`](./TASKS.md). Add yourself when starting a task to avoid overlap.
Stub service that writes a placeholder Unity project zip.
A lightweight service that scaffolds a Unity project and packages it as a zip file.

- **Endpoint:** `POST /export`
- **Body (optional):**
  - `projectName` — folder name for the generated project.
  - `sceneName` — default scene stub to create under `Assets/Scenes`.
  - `scriptName` — C# script file name created under `Assets/Scripts`.
  - `scriptContents` — override the default `MonoBehaviour` template.
  - `sceneContents` — override the placeholder scene notes.
- **Output:** `downloads/<project>-<timestamp>.zip`

The exporter creates Unity-style directories (`Assets`, `Packages`, `ProjectSettings`) with
starter content so collaborators can open the archive directly in Unity and continue building.
Service that builds a starter Unity project archive on demand.

- **Endpoint:** `POST /export`
- **Body:** optional JSON `{ "projectName": "MyProject", "sceneName": "IntroScene" }`
- **Output:** `downloads/<project-name>-<timestamp>-<hash>.zip`

The zip includes a Unity project root with:

- Default project and package settings targeting Unity `2022.3.17f1`.
- A sample scene with a camera and directional light.
- A `HelloBlackRoad` MonoBehaviour script and quick-start README.
A lightweight service that assembles a starter Unity project and packages it as a zip archive. The exported archive contains Assets, ProjectSettings, and Packages directories so the project opens cleanly in Unity 2022.3 LTS and newer releases.

## Local development

```bash
npm install
node server.js
```

Then, in a separate shell, request an export:

```bash
curl -X POST http://localhost:3000/export \
  -H "Content-Type: application/json" \
  -d '{"projectName":"BlackRoadShowcase","sceneName":"DemoScene"}'
```

The generated archive will be placed in the `downloads/` directory.
Service that assembles a Unity-friendly project archive from structured JSON input.

- **Endpoint:** `POST /export`
- **Request Body (JSON):**
  - `projectName` *(string, optional)* – project label used for the root folder and archive name.
  - `description` *(string, optional)* – copied into the generated `README.md`.
  - `scenes` *(array, optional)* – list of scene descriptors. Each entry may specify:
    - `name` – scene display name.
    - `description` – note surfaced in the bootstrap MonoBehaviour.
    - `camera.position` `{ x, y, z }` – initial camera placement.
    - `camera.rotation` `{ x, y, z }` – Euler rotation values.
    - `rotationSpeed` – cube rotation speed exposed to the bootstrap script.
- **Output:** Timestamped zip in `downloads/` containing:
  - `Packages/manifest.json` with baseline dependencies.
  - `ProjectSettings/` assets (editor build settings + Unity version).
  - `Assets/Scripts/Bootstrap.cs` and metadata file.
  - `Assets/Scenes/*.unity` stubs wired to the bootstrap MonoBehaviour (+ `.meta`).
  - `blackroad_export.json` manifest of the export request and `README.md` summary.

## Example

```bash
curl -X POST http://localhost:3000/export \
  -H 'Content-Type: application/json' \
  -d '{
        "projectName": "BlackRoad Prototype",
        "description": "Generated via exporter",
        "scenes": [
          {
            "name": "City",
            "description": "Daytime lighting stub",
            "camera": {"position": {"x": 0, "y": 2, "z": -6}},
            "rotationSpeed": 20
          }
        ]
      }'
```

The response includes the final archive name, filesystem path, and echoed metadata describing the generated project.
Exports a Unity-ready project scaffold that teams can open directly in the editor.

- **Endpoint:** `POST /export`
- **Output directory:** `downloads/`
- **Response payload:** `{ ok, path, projectName, scenes, size, createdAt }`

## Request Format

Send a JSON body describing the desired project and scenes:

```jsonc
POST /export
{
  "projectName": "BlackRoad Sandbox",
  "description": "Prototype environment generated from the console.",
  "scenes": ["MainHub", "Playground"]
}
```

All fields are optional:

- `projectName` defaults to `BlackRoadUnityProject`.
- `scenes` defaults to `["MainScene"]` and is de-duplicated/sanitized.
- `description` is written into the generated README.

## Generated Layout

The zip bundles a minimal Unity 2022.3 LTS project with:

- `Assets/Scenes/*.unity` placeholders for each requested scene.
- `Packages/manifest.json` pre-populated with URP, TextMeshPro, and editor integrations.
- `ProjectSettings/` files (`ProjectVersion.txt`, `ProjectSettings.asset`, `EditorBuildSettings.asset`).
- `README.md` with setup guidance and the provided description.

This scaffold is designed for rapid iteration; teams can swap assets, update packages, or plug into a dedicated build pipeline as needed.
Stub Unity exporter that now emits a bootable prototype project zip.

- **Endpoint:** `POST /export`
- **Body:**
  ```jsonc
  {
    "projectName": "Orbital Lab",
    "description": "Zero-g lab mock up",
    "scene": {
      "name": "LabDeck",
      "objects": [
        {
          "name": "CentralPlatform",
          "type": "Cylinder",
          "position": { "x": 0, "y": 0, "z": 0 },
          "scale": { "x": 3, "y": 0.25, "z": 3 }
        }
      ]
    }
  }
  ```
- **Output:** `downloads/<slug>-<timestamp>.zip`
- **Contents:** Unity scene, runtime bootstrap script, and machine-readable scene plan.

Open the generated project in Unity 2021 LTS (or newer) and load the scene from
`Assets/Scenes`. The `GeneratedSceneController` component spawns the configured
primitives at runtime so teams can iterate without hand-authoring boilerplate.
Service that assembles a minimal Unity project scaffold and zips it for
download.

## Endpoint

- **Route:** `POST /export`
- **Output:** JSON payload describing the generated archive. The archive is
  written to `downloads/<project>-<timestamp>.zip`.

## Request body

```json
{
  "projectName": "SpaceGarden",
  "description": "Prototype scenes for the Space Garden concept.",
  "scenes": ["Hub", { "name": "Playfield" }]
}
```

- `projectName` (optional): name used for the Unity project folder. Defaults to
  `BlackRoadUnity` when omitted or invalid.
- `description` (optional): written to the generated README.
- `scenes` (optional): array of scene names (string or `{ "name": string }`).
  Invalid entries are ignored and at least one placeholder scene is always
  created.

## Response

```json
{
  "ok": true,
  "projectName": "SpaceGarden",
  "path": "/app/workers/unity/downloads/SpaceGarden-lxqhcp.zip",
  "files": [
    "Assets/Scenes/Hub.unity",
    "Assets/Scenes/Playfield.unity",
    "Assets/Scripts/README.md",
    "Packages/manifest.json",
    "ProjectSettings/EditorBuildSettings.asset",
    "ProjectSettings/ProjectVersion.txt",
    "README.md"
  ]
}
```

Each `.unity` scene file is a placeholder that should be opened and saved in the
Unity editor. The archive includes minimal ProjectSettings and Packages content
so the project can be opened immediately.
Service that assembles a templated Unity project archive with a default
scene, bootstrap script, and project settings wired for Unity 2022 LTS.

- **Endpoint:** `POST /export`
- **Request body (optional):**
  - `projectName` – name used for the root folder inside the archive.
  - `sceneName` – overrides the default scene name (`SampleScene`).
  - `description` – appended to the generated README for quick context.
- **Output:** `downloads/<project-name>-<timestamp>.zip`

The generated archive contains:

- `Assets/Scenes/<sceneName>.unity` – starter scene with camera and light.
- `Assets/Scripts/BlackRoadBootstrap.cs` – simple MonoBehaviour logging a
  welcome message when Play Mode starts.
- `ProjectSettings` and `Packages` manifests pre-populated for a 3D URP
  workflow.
- `README.md` describing how to open the project and next steps.

Future work can swap the static templates for real Unity Editor exports or
CI-driven builds.
A lightweight scaffolding service that builds a Unity-compatible project template and delivers it as a ZIP archive. Use it to bootstrap prototypes while the full build pipeline is under construction.

## Features

- Generates a structured Unity project with Assets, Packages, and ProjectSettings folders.
- Accepts metadata such as project name, scene names, notes, and package overrides.
- Emits a `BlackRoad/export.json` manifest summarizing the export payload.
- Available as both an HTTP endpoint and a local CLI helper (`npm run export:sample`).

## Quick Start

```bash
cd workers/unity
npm install
npm run export:sample
```

The sample script writes a fresh archive to `downloads/unity/` and prints the metadata payload. Feel free to edit `scripts/export-sample.mjs` to match your prototype requirements.

To run the HTTP service instead:

```bash
npm start
```

This launches the Express server on `http://localhost:3000`. Use the `/export` route described below.

## HTTP API

`POST /export`

**Request body**

```json
{
  "projectName": "BlackRoad Sandbox",
  "description": "Playable block world prototype",
  "author": "PrototypeAgent",
  "scenes": ["Landing", "Gameplay", "Credits"],
  "notes": "Focus on controller feel + chunk streaming",
  "packages": [
    "com.unity.cinemachine@2.9.7",
    { "name": "com.unity.postprocessing", "version": "3.4.1" }
  ]
}
```

**Response**

```json
{
  "ok": true,
  "path": "/workspace/blackroad-prism-console/downloads/unity/blackroad-sandbox-2025-10-05T00-00-00-000Z.zip",
  "fileName": "blackroad-sandbox-2025-10-05T00-00-00-000Z.zip",
  "bytesWritten": 14823,
  "project": {
    "projectName": "BlackRoad Sandbox",
    "slug": "blackroad-sandbox",
    "description": "Playable block world prototype",
    "author": "PrototypeAgent",
    "createdAt": "2025-10-05T00:00:00.000Z",
    "scenes": [
      { "name": "Landing", "file": "Assets/Scenes/Landing.unity" },
      { "name": "Gameplay", "file": "Assets/Scenes/Gameplay.unity" },
      { "name": "Credits", "file": "Assets/Scenes/Credits.unity" }
    ],
    "packages": {
      "com.unity.collab-proxy": "2.0.6",
      "com.unity.inputsystem": "1.7.0",
      "com.unity.textmeshpro": "3.0.6",
      "com.unity.cinemachine": "2.9.7",
      "com.unity.postprocessing": "3.4.1"
    }
  }
}
```

### Validation rules

- `projectName` must be a non-empty string.
- `scenes` can be a string or array; invalid entries are replaced with numbered placeholders.
- `packages` accepts arrays of strings (`"name@version"`), arrays of `{ name, version }` objects, or a dictionary of package names to versions.

### Output Layout

The exported archive contains:

```
<ProjectSlug>/
  README.md
  BlackRoad/export.json
  Documentation/notes.md
  Assets/
    Scenes/<Scene>.unity
    Scripts/README.md
  Packages/manifest.json
  ProjectSettings/
    ProjectSettings.asset
    ProjectVersion.txt
    EditorBuildSettings.asset
```

Use the placeholders as a starting point and replace them with production-ready content inside the Unity editor.
Generates a ready-to-open Unity project template that boots with a welcome scene, camera, light, and a simple `MonoBehaviour` script. The exporter hydrates placeholders in the template so each archive reflects the requested project and scene names.

## API

### `GET /health`
Returns `{ ok: true }` for liveness probes.

### `POST /export`
Creates a zipped Unity project under `downloads/`.

**Request body**
```json
{
  "projectName": "BlackRoadExplorer",
  "sceneName": "LandingScene"
}
```
Both fields are optional; they default to `BlackRoadUnityProject` and `MainScene` when omitted.

**Response**
```json
{
  "ok": true,
  "path": "downloads/blackroadexplorer.zip",
  "projectName": "BlackRoadExplorer",
  "sceneName": "LandingScene",
  "archiveName": "blackroadexplorer.zip"
}
```

The archive contains:
- `Assets/Scenes/<Scene>.unity` — starter scene with camera, light, and welcome rig.
- `Assets/Scripts/WelcomeController.cs` — rotates the rig and logs the welcome message.
- `Packages/manifest.json` — standard desktop dependencies.
- `ProjectSettings/` — version/build settings so Unity opens the project without prompts.
- `README.md` — instructions embedded in the template.

The exporter requires the `zip` CLI (available in the runtime containers used by this repo).

## Local development

```bash
cd workers/unity
node server.js
curl -X POST http://localhost:3000/export \
  -H "Content-Type: application/json" \
  -d '{"projectName":"Demo", "sceneName":"IntroScene"}'
```

The generated archive lives in `workers/unity/downloads/` when running locally.
Generates a ready-to-import Unity project template with metadata, scene, and script stubs.

- **Endpoint:** `POST /export`
- **Output:** `downloads/<project-slug>.zip`

## Request payload

```json
{
  "projectName": "BlackRoad Prism World",
  "sceneName": "Gateway Plaza",
  "description": "Starter Unity scene generated by the Prism exporter.",
  "author": "BlackRoad Studios"
}
```

All fields are optional. The exporter sanitizes input, derives a scene filename, and stamps metadata into the generated assets.

## Generated structure

```
<slug>.zip
├── README.md
├── .gitignore
├── ProjectSettings/
│   ├── ProjectSettings.asset
│   ├── ProjectVersion.txt
│   └── EditorBuildSettings.asset
├── Packages/
│   ├── manifest.json
│   └── packages-lock.json
└── Assets/
    ├── Scenes/
    │   ├── <SceneName>.unity
    │   └── <SceneName>.unity.meta
    └── Scripts/
        ├── SceneMetadata.cs
        └── SceneMetadata.cs.meta
```

The included `SceneMetadata` MonoBehaviour logs project details at runtime so teammates know where the scene originated.
Stub service that writes a placeholder Unity project zip with a basic scene and script scaffold.

- **Endpoint:** `POST /export`
- **Request Body (optional):**
  - `projectName`: Custom folder name used inside the archive.
  - `sceneName`: Scene file name placed under `Assets/Scenes/`.
  - `scriptName`: MonoBehaviour script generated under `Assets/Scripts/`.
- **Output:** Timestamped archive under `downloads/<projectName>-<timestamp>.zip`

The generated archive includes Unity `ProjectSettings`, `Packages` manifests, a sample scene containing a camera and cube, and a `MonoBehaviour` script that rotates the cube. Replace with a real Unity build pipeline when available.
Generates a ready-to-open Unity project archive from a lightweight JSON payload.
The service copies a templated project, rewrites metadata based on the request,
and ships a zipped folder into `downloads/` for downstream automation.

- **Endpoint:** `POST /export`
- **Response:** JSON metadata plus the path to the generated zip
- **Unity version:** 2022.3.18f1 (safe to upgrade in the template if required)

## Request shape

```jsonc
{
  "projectName": "BlackRoad Systems Prototype",   // optional
  "sceneName": "Launch Pad",                      // optional
  "author": "Agent Smith",                        // optional
  "description": "Short summary for the README.", // optional
  "sceneGuid": "...",                             // optional 32-char hex
  "scriptGuid": "..."                             // optional 32-char hex
}
```

All fields are optional. Missing or empty values fall back to sensible defaults
(`BlackRoad Sample`, `Sample Scene`, etc.).

## Response payload

```jsonc
{
  "ok": true,
  "path": "<absolute path to downloads/<slug>.zip>",
  "project": {
    "name": "BlackRoad Systems Prototype",
    "slug": "blackroad-systems-prototype",
    "scene": {
      "name": "Launch Pad",
      "file": "Assets/Scenes/LaunchPad.unity",
      "guid": "3c2f..."
    },
    "scriptGuid": "a451...",
    "author": "Agent Smith",
    "description": "Short summary for the README."
  }
}
```

## Template contents

The template (under `./template`) includes:

- `ProjectSettings/ProjectVersion.txt` pinned to Unity `2022.3.18f1`
- `ProjectSettings/ProjectSettings.asset` with placeholder metadata
- `Packages/manifest.json` with core dependencies only
- `Assets/Scenes/<Scene>.unity` and matching `.meta` file wired to the supplied GUID
- `Assets/Scripts/HelloBlackRoad.cs` plus `.meta` file, pre-attached in the scene
- A generated README summarizing the chosen metadata for collaborators

Feel free to evolve the template to match evolving project standards (URP/HDRP,
additional packages, custom scripts, etc.).

## Running locally

```bash
cd workers/unity
npm install
node server.js
```

Then POST to `http://localhost:3000/export` with your JSON payload. The resulting
zip lands under `workers/unity/downloads/`.
npm start
```

The service listens on port `3000` by default. Use `PORT=<number> npm start` to override the port.

## API

- **Endpoint:** `POST /export`
- **Body (JSON):**
  - `projectName` (string, optional) – project title used for generated files.
  - `description` (string, optional) – copied into the generated README.
  - `scenes` (array of strings, optional) – scene names to scaffold under `Assets/Scenes`.
- **Response:**
  ```json
  {
    "ok": true,
    "path": "<absolute path to the zip file>",
    "fileName": "<archive name>",
    "projectName": "<resolved project name>",
    "scenes": ["..."],
    "description": "..."
  }
  ```

## Example

```bash
curl -X POST http://localhost:3000/export \
  -H "Content-Type: application/json" \
  -d '{
        "projectName": "BlackRoad Sandbox",
        "description": "Prototype world streaming sandbox",
        "scenes": ["MainMenu", "Gameplay", "Credits"]
      }'
```

The service responds with the archive location inside the `downloads/` folder (created on demand). Each scene receives a placeholder `.unity` file so the project opens without errors, and metadata files are populated with sensible defaults for further iteration.
Service that generates a minimal, bootable Unity project template and returns
the path to a zipped archive on disk.
Creates a downloadable Unity project scaffold so collaborators can start from a consistent baseline.

## API
- **Endpoint:** `POST /export`
- **Request body (optional):** `{ "projectName": "MyPrototype" }`
- **Output:** JSON payload containing the resolved project name, on-disk path,
  and file list for the generated archive.
- **Archive contents:**
  - Project scaffolding (Assets, Packages, ProjectSettings)
  - A sample scene with a camera + directional light
  - Starter `Bootstrap.cs` script with a console log
  - Unity `manifest.json` and `ProjectVersion.txt` set to 2022.3 LTS

Example invocation:

```bash
curl -X POST http://localhost:3000/export \
  -H "Content-Type: application/json" \
  -d '{"projectName":"BlackRoadPrototype"}'
```

Replace with a full Unity build pipeline once the exporter is wired to actual
project assets and CI artifacts.
Service that assembles a starter Unity project zip from a maintained
template.

- **Endpoint:** `POST /export`
- **Body:**
  ```json
  {
    "projectName": "My Space Sim",
    "description": "Pitch or design notes for the build",
    "welcomeMessage": "Custom log message for the bootstrap script"
  }
  ```
- **Output:** `downloads/<projectName>-<timestamp>.zip`
- **Contents:**
  - `Packages/manifest.json` and `ProjectSettings/ProjectVersion.txt`
    seeded from the repository template.
  - `Assets/Scripts/BlackRoadBootstrap.cs` generated with the provided
    project name and welcome message.
  - `PROJECT_OVERVIEW.md` summarising next steps and mirroring the
    supplied description.
  - `BlackRoadConfig.json` capturing the request payload for traceability.

### Local development

```bash
npm install
npm start
# POST to http://localhost:3000/export with the JSON body above
```
Stub service that now assembles a lightweight, editor-ready Unity project
template. The export is a `.zip` archive that includes project settings,
package manifest, and a simple SampleScene so the project opens cleanly in
Unity Hub.

- **Endpoint:** `POST /export`
- **Body:**
  ```json
  {
    "projectName": "OptionalName", // defaults to "BlackRoadUnityTemplate"
    "description": "Optional README summary"
  }
  ```
- **Output:** `downloads/<sanitized-project-name>.zip`
- **Response:** lists all files included in the archive for quick inspection.

The service writes exported archives to `downloads/`. Remove old files as
needed to avoid confusion during iterative testing.
Service that scaffolds a Unity project archive from structured JSON input.

- **Endpoint:** `POST /export`
- **Output:** `downloads/<project-name>-<timestamp>.zip`
- **Runtime:** Node.js 20 / Express

## Request payload

```json
{
  "projectName": "SpaceMiner",
  "companyName": "BlackRoad",
  "productName": "Space Miner",
  "unityVersion": "2022.3.40f1",
  "scenes": [
    { "name": "MainMenu", "description": "UI scene" },
    { "name": "Gameplay", "enabled": true }
  ],
  "packages": [
    { "name": "com.unity.cinemachine", "version": "2.9.7" },
    "com.unity.inputsystem"
  ]
}
```

All fields are optional. Missing data falls back to sensible defaults (SampleScene, URP packages, etc.).

## Response payload

```json
{
  "ok": true,
  "project": {
    "name": "SpaceMiner",
    "unityVersion": "2022.3.40f1",
    "companyName": "BlackRoad",
    "productName": "Space Miner"
  },
  "scenes": [
    {
      "name": "Gameplay",
      "path": "Assets/Scenes/Gameplay.unity",
      "enabled": true
    },
    {
      "name": "MainMenu",
      "path": "Assets/Scenes/MainMenu.unity",
      "enabled": true
    }
  ],
  "packages": {
    "com.unity.ide.rider": "3.0.29",
    "com.unity.render-pipelines.universal": "14.0.11",
    "com.unity.cinemachine": "2.9.7",
    "com.unity.inputsystem": "latest"
  },
  "requestedPackages": [
    { "name": "com.unity.cinemachine", "version": "2.9.7" },
    { "name": "com.unity.inputsystem", "version": "latest" }
  ],
  "archive": {
    "path": "downloads/SpaceMiner-lmno1234.zip",
    "sizeBytes": 12345
  }
}
```

> `archive.path` is relative to the worker root so callers can publish or stream the file elsewhere. `requestedPackages` echoes the caller-supplied overrides for quick auditing.

## Generated layout

The exporter synthesises a Unity-friendly skeleton:

```
<project>
├── Assets/
│   └── Scenes/
│       └── <SceneName>.unity
├── Packages/
│   └── manifest.json
├── ProjectSettings/
│   ├── EditorBuildSettings.asset
│   ├── ProjectSettings.asset
│   └── ProjectVersion.txt
└── README.md
```

Scene files use a lightweight YAML stub with a root `GameObject` so Unity can import them immediately.

## Development

```bash
cd workers/unity
npm install
node server.js
```

Send a request with `curl`:

```bash
curl -X POST http://localhost:3000/export \
  -H 'content-type: application/json' \
  -d '{"projectName":"Test","scenes":["Main"]}'
```

Run the automated test suite with:

```bash
npm test
```

The service requires the `zip` CLI (present in the base container and Dockerfile).

## Coordination

See [`TASKS.md`](./TASKS.md) for the shared backlog and ownership tracking so multiple agents avoid duplicate work.
Service that produces a minimal-but-legit Unity project template zip.

- **Health check:** `GET /healthz`
- **Export endpoint:** `POST /export`
  - Optional body: `{ "projectName": "MyProject", "sceneName": "Intro" }`
  - Output: timestamped archive in `downloads/`
- **Contents:** Unity 2022.3 scene (camera + light), sample script, manifest, and project settings.

The generated scene can be opened directly in Unity. Customize the request body to stamp a project/scene name and share the resulting archive with other agents.
- **Body:**
  ```json
  {
    "projectName": "OptionalName",
    "description": "Optional summary that lands in README.md"
  }
  ```
- **Response:**
  ```json
  {
    "ok": true,
    "projectName": "OptionalName",
    "zipName": "OptionalName-1700000000000.zip",
    "zipPath": "<repo>/downloads/OptionalName-1700000000000.zip",
    "filesGenerated": 6
  }
  ```

## Output
The archive includes:
- `README.md` primed with the supplied description.
- `ProjectSettings/ProjectVersion.txt` targeting Unity `2022.3.16f1`.
- A minimal `EditorBuildSettings.asset` referencing the prototype scene.
- `Packages/manifest.json` with baseline dependencies used across our tooling.
- `Assets/Scenes/Prototype.unity` containing a bootstrapped scene root.
- `Assets/Scripts/Bootstrap.cs` to verify scripting setup.

## Requirements
- Node.js 18+
- The `zip` CLI (`apt install zip` on Debian/Ubuntu) used to package the scaffold.

## Local Development
1. Install dependencies: `npm install` (only Express at the moment).
2. Start the worker: `node server.js` (or `npm start` if you add a script).
3. Trigger an export:
   ```bash
   curl -X POST http://localhost:3000/export \
     -H "content-type: application/json" \
     -d '{"projectName": "BlackRoadPrototype", "description": "Shared sandbox for gameplay experiments."}'
   ```
4. Retrieve the zip from the `downloads/` directory.

## Next Steps
See [`TASKS.md`](./TASKS.md) for coordination notes and upcoming improvements.
HTTP service that assembles a ready-to-open Unity project archive.

- **Endpoint:** `POST /export`
- **Output:** `downloads/<project-name>-<timestamp>.zip`

## Request Body

```json
{
  "projectName": "OrbitalGarden",
  "sceneName": "Greenhouse",
  "summary": "Prototype a systems-driven farming loop inside a biodome.",
  "features": [
    "Day/night cycle tied to plant growth",
    "Oxygen budget that shifts with player actions",
    "Narrative beats delivered via radio chatter"
  ]
}
```

All fields are optional. Sensible defaults are supplied when omitted.

## Archive Layout

The generated project contains a conventional Unity folder structure:

```
<ProjectName>/
  Assets/
    Scenes/
      <SceneName>.unity
      <SceneName>.unity.meta
    Scripts/
      <SceneName>Director.cs
      <SceneName>Director.cs.meta
  Packages/
    manifest.json
  ProjectSettings/
    EditorBuildSettings.asset
    ProjectSettings.asset
    ProjectVersion.txt
  README.md
```

`manifest.json` references common packages (Cinemachine, Input System, Timeline, TextMeshPro, Test Framework) to accelerate prototyping.

## Response

```json
{
  "ok": true,
  "path": "/workspace/blackroad-prism-console/workers/unity/downloads/OrbitalGarden-2025-10-05T14-33-21-123Z.zip",
  "fileName": "OrbitalGarden-2025-10-05T14-33-21-123Z.zip",
  "files": [
    "OrbitalGarden/Assets/Scenes/Greenhouse.unity",
    "OrbitalGarden/Assets/Scenes/Greenhouse.unity.meta",
    "OrbitalGarden/Assets/Scripts/GreenhouseDirector.cs",
    "OrbitalGarden/Assets/Scripts/GreenhouseDirector.cs.meta",
    "OrbitalGarden/Packages/manifest.json",
    "OrbitalGarden/ProjectSettings/EditorBuildSettings.asset",
    "OrbitalGarden/ProjectSettings/ProjectSettings.asset",
    "OrbitalGarden/ProjectSettings/ProjectVersion.txt",
    "OrbitalGarden/README.md"
  ],
  "metadata": {
    "projectName": "OrbitalGarden",
    "sceneName": "Greenhouse",
    "scriptClass": "GreenhouseDirector",
    "unityVersion": "2022.3.17f1",
    "generatedAt": "2025-10-05T14:33:21.123Z",
    "featureCount": 3
  }
}
```

## Notes

- Archives are written to `workers/unity/downloads/` by default. Clean the directory periodically if space becomes an issue.
- The generated scene includes a `MonoBehaviour` that echoes the requested summary and features at runtime.
- Replace the stub YAML/Text content with authoritative exports when the real build pipeline is available.
The Unity exporter service turns a lightweight project template into a downloadable zip
that downstream build jobs can hydrate with real assets.

## API

- **Endpoint:** `POST /export`
- **Body:**
  ```json
  {
    "projectName": "BlackRoadPrototype",
    "sceneName": "SampleScene"
  }
  ```
  Both fields are optional. Names are sanitized to alphanumeric, space, underscore, and
  hyphen characters before being applied to the template.
- **Output:**
  ```json
  {
    "ok": true,
    "project": "BlackRoadPrototype",
    "scene": "SampleScene",
    "path": "/app/downloads/BlackRoadPrototype.zip"
  }
  ```
  The response path points to the generated archive on disk. Future iterations should
  stream the archive or upload it to object storage for direct download links.

## How It Works

1. Copies the `template/` directory into a temporary workspace.
2. Replaces `{{PROJECT_NAME}}` and `{{SCENE_NAME}}` tokens inside text files.
3. Runs the `zip` utility so the archive includes the project root folder.
4. Stores the archive under `downloads/` (creating the directory if needed).

The container image now installs the `zip` CLI to support step 3. Any environment running
the exporter locally must also provide the `zip` executable.

## Template Layout

```
template/
├── Assets
│   └── Scenes
│       └── SampleScene.unity
├── Packages
│   └── manifest.json
└── ProjectSettings
    ├── EditorBuildSettings.asset
    ├── ProjectSettings.asset
    └── ProjectVersion.txt
```

Text files within the template use simple tokens for substitution. Add new placeholders as
needed and register the file extensions in `server.js` so they receive replacements.

## Local Development

```bash
npm install
npm run start # or: node server.js
curl -X POST http://localhost:3000/export \
  -H "Content-Type: application/json" \
  -d '{"projectName":"CityBuilder","sceneName":"Plaza"}'
```

The command returns the path to `downloads/CityBuilder.zip`. Extract the archive to inspect
the generated Unity scaffold.

## Next Steps
Stub service that builds a structured Unity project archive that can be
opened directly in the editor. The scaffold includes default project
settings, a sample scene, and a starter C# MonoBehaviour script so teams
can iterate without starting from an empty workspace.

- **Endpoint:** `POST /export`
- **Output:** `downloads/<project-slug>-<timestamp>.zip`

### Request Payload

```json
{
  "projectName": "Orbital Lab",
  "description": "Physics-driven sandbox prototype",
  "scenes": ["LaunchPad", "ZeroGHangar"]
}
```

- `projectName` (optional): Shown in the README and used for archive
  naming.
- `description` (optional): Added to the README and the starter script
  summary.
- `scenes` (optional): Array of scene names to pre-create under
  `Assets/Scenes`. Defaults to `SampleScene`.

### Generated Contents

- `README.md` with setup instructions and project metadata.
- `ProjectSettings/` assets including a Unity 2022.3 LTS
  `ProjectVersion.txt` and build settings referencing generated scenes.
- `Packages/manifest.json` with common Unity packages preconfigured.
- `Assets/Scenes/*.unity` YAML scenes referencing the starter script.
- `Assets/Scripts/HelloBlackRoad.cs` MonoBehaviour that rotates the
  attached object and logs project boot info.

See [TASKS.md](./TASKS.md) for the coordination board tracking exporter follow-ups.
Generates a minimal Unity project template zip that can be imported into the editor.

- **Endpoint:** `POST /export`
- **Request Body (optional):**
  - `projectName` – friendly name used for the root folder inside the archive.
  - `sceneName` – name for the starter scene (defaults to `MainScene`).
  - `description` – blurb stored in the generated README and scene metadata.
- **Output:** Timestamped archive in `downloads/<project>-<epoch>.zip`

Names are sanitised to alphanumeric characters, underscores, and hyphens to keep Unity import happy.

Each export includes:

- `Packages/manifest.json` with common Unity LTS dependencies.
- `ProjectSettings/ProjectVersion.txt` pinned to Unity 2022.3 LTS.
- `Assets/Scenes/<sceneName>.unity` containing a welcome `MonoBehaviour`.
- `Assets/Scripts/BlackRoadWelcome.cs` logging to the Unity console.
- `README.md` describing how to open the template.

Future work: replace the templated content with a real build pipeline once Unity CI/CD is available.
The Unity exporter service now scaffolds starter projects for one or more
Unity editor versions. Each request produces a zipped workspace that Codex
can extend, pre-populated with render pipeline dependencies and placeholder
scenes.

## Running the service

```bash
cd workers/unity
npm install
node server.js
```

The server listens on `PORT` (defaults to `3000`).

## Request format

`POST /export`

```jsonc
{
  "projectName": "BlackRoadSandbox",
  "unityVersions": ["2022.3.10f1", "6000.0.4f1"],
  "renderPipeline": "hdrp",          // builtin | urp | hdrp (optional)
  "template": "learning-lab"          // optional tag stored in the scene
}
```

### Response

```jsonc
{
  "ok": true,
  "projectName": "BlackRoadSandbox",
  "renderPipeline": "hdrp",
  "template": "learning-lab",
  "exports": [
    { "version": "2022.3.10f1", "path": "/.../downloads/BlackRoadSandbox-2022.3.10f1.zip" },
    { "version": "6000.0.4f1", "path": "/.../downloads/BlackRoadSandbox-6000.0.4f1.zip" }
  ]
}
```

Each archive contains:

- `ProjectSettings/ProjectVersion.txt` – locks the Unity editor release.
- `Packages/manifest.json` – enables render pipeline dependencies plus
  Cinemachine, Timeline, and IDE tooling.
- `ProjectSettings/ProjectSettings.asset` – seeds desktop-friendly defaults.
- `Assets/Scenes/<projectName>.unity` – placeholder scene annotated with the
  selected template tag.
- `README.md` – step-by-step instructions that reference the Codex Unity
  prompts for rapid follow-on authoring.

## Codex workflow

- **Endpoint:** `POST /export`
- **Body:**
  ```json
  {
    "projectName": "OptionalName", // defaults to "BlackRoadUnityTemplate"
    "description": "Optional README summary"
  }
  ```
- **Output:** `downloads/<sanitized-project-name>.zip`
- **Response:** lists all files included in the archive for quick inspection.

After extracting a generated archive, open it in Unity Hub and use the
prompts in [`codex/prompts/blackroad_high_impact_codex_prompts.prompt.md`](../../codex/prompts/blackroad_high_impact_codex_prompts.prompt.md)
to ask Codex for scene setup, gameplay scripts, or simulation logic. Keeping
multiple Unity versions installed lets Codex prototype against both long-term
support releases and the bleeding-edge editor, matching the "two versions"
request from production and research teams.
