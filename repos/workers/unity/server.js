import crypto from "crypto";
import { createWriteStream } from "fs";
import express from "express";
import path from "path";
import { exportUnityProject } from "./src/exporter.js";
import { mkdir, writeFile } from "fs/promises";
import { execFile } from "child_process";
import {
  mkdtemp,
  mkdir,
  rm,
  writeFile
} from "fs/promises";
import os from "os";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
import archiver from "archiver";
import { mkdir } from "fs/promises";
import { createWriteStream } from "fs";
import archiver from "archiver";
import crypto from "crypto";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { buildUnityTemplate } from "./template.js";
import {
  mkdir,
  mkdtemp,
  rename,
  rm,
  writeFile,
} from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { promisify } from "util";
import { execFile } from "child_process";
import { randomUUID } from "crypto";

const execFileAsync = promisify(execFile);
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import archiver from "archiver";
import archiver from "archiver";
import crypto from "crypto";
import { createWriteStream } from "fs";
import { mkdtemp, mkdir, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { ZipFile } from "yazl";

const DEFAULT_EDITOR_VERSION = "2022.3.0f1";
const DEFAULT_PROJECT_NAME = "BlackRoadUnitySample";
const DEFAULT_SCENE_NAME = "SampleScene";
import { createWriteStream } from "fs";
import { mkdir, rm } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import Yazl from "yazl";
import archiver from "archiver";
import { createWriteStream } from "fs";
import { mkdir, readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import archiver from "archiver";

const DEFAULT_PROJECT_NAME = "BlackRoadUnityTemplate";

const TEMPLATE_FILES = (
  projectName,
  description
) => {
  const sanitizedDescription = description?.trim() ||
    "Generated Unity template scaffolded by the Prism console worker.";
  const readme = `# ${projectName}\n\n${sanitizedDescription}\n\n` +
    "## Getting started\n" +
    "1. Open this folder in Unity Hub.\n" +
    "2. Let Unity upgrade assets if prompted.\n" +
    "3. Press Play to run the SampleScene.\n";

  const manifest = {
    dependencies: {
      "com.unity.collab-proxy": "1.17.7",
      "com.unity.ide.rider": "3.0.24",
      "com.unity.ide.visualstudio": "2.0.22",
      "com.unity.ide.vscode": "1.2.5",
      "com.unity.test-framework": "1.3.9",
      "com.unity.textmeshpro": "3.0.6",
      "com.unity.timeline": "1.7.6",
      "com.unity.ugui": "1.0.0",
      "com.unity.modules.ai": "1.0.0",
      "com.unity.modules.animation": "1.0.0",
      "com.unity.modules.audio": "1.0.0",
      "com.unity.modules.physics": "1.0.0",
      "com.unity.modules.ui": "1.0.0"
    }
  };

  const sampleScene = `%
YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!29 &1
Scene:
  m_ObjectHideFlags: 0
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_RootOrder: 0
  m_EditorData: {}
  m_Entities:
  - {fileID: 2}
  - {fileID: 4}
--- !u!1 &2
GameObject:
  m_Component:
  - component: {fileID: 3}
  m_Name: Main Camera
--- !u!20 &3
Camera:
  m_ClearFlags: 1
  m_BackGroundColor: {r: 0.19215687, g: 0.3019608, b: 0.4745098, a: 0}
  near clip plane: 0.3
  far clip plane: 1000
--- !u!1 &4
GameObject:
  m_Component:
  - component: {fileID: 5}
  m_Name: Directional Light
--- !u!108 &5
Light:
  m_Type: 1
  m_Color: {r: 1, g: 0.95686275, b: 0.8392157, a: 1}
`;

  return [
    {
      path: "README.md",
      content: readme
    },
    {
      path: "ProjectSettings/ProjectVersion.txt",
      content:
        "m_EditorVersion: 2022.3.0f1\nm_EditorVersionWithRevision: 2022.3.0f1 (1234567890abcdef)\n"
    },
    {
      path: "Packages/manifest.json",
      content: JSON.stringify(manifest, null, 2) + "\n"
    },
    {
      path: "Assets/Scenes/SampleScene.unity",
      content: sampleScene
    },
    {
      path: "Assets/Scenes.meta",
      content:
        "fileFormatVersion: 2\nGUID: 00000000000000000000000000000000\nfolderAsset: yes\n"
    },
    {
      path: "Assets/Scenes/SampleScene.unity.meta",
      content:
        "fileFormatVersion: 2\nGUID: 11111111111111111111111111111111\n"
    }
  ];
};

function sanitizeProjectName(rawName) {
  if (typeof rawName !== "string") {
    return DEFAULT_PROJECT_NAME;
  }
  const normalized = rawName.trim().replace(/[^A-Za-z0-9_-]+/g, "-");
  const cleaned = normalized.replace(/^-+|-+$/g, "");
  return cleaned || DEFAULT_PROJECT_NAME;
}

async function writeTemplateZip(zipPath, files) {
  await mkdir(path.dirname(zipPath), { recursive: true });

  await new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);

    files.forEach((file) => {
      archive.append(file.content, { name: file.path });
    });

    archive.finalize();
  });
}
import { createUnityProject } from "./exporter.js";
import {
  cp,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "fs/promises";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { fileURLToPath } from "url";
import { promisify } from "util";
import archiver from "archiver";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import { finished } from "stream/promises";

const DEFAULT_PROJECT_NAME = "BlackRoadPrototype";
const DEFAULT_SCENE_NAME = "MainScene";

const DEFAULT_DESCRIPTION = "Unity prototype generated by BlackRoad";

const WELCOME_SCRIPT_GUID = "5e5e2f3a2a2040809ebd2c7c8bbd2c7b";
import JSZip from "jszip";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import archiver from "archiver";

const DEFAULT_PROJECT_NAME = "BlackRoadUnityTemplate";

const TEMPLATE_FILES = (
  projectName,
  description
) => {
  const sanitizedDescription = description?.trim() ||
    "Generated Unity template scaffolded by the Prism console worker.";
  const readme = `# ${projectName}\n\n${sanitizedDescription}\n\n` +
    "## Getting started\n" +
    "1. Open this folder in Unity Hub.\n" +
    "2. Let Unity upgrade assets if prompted.\n" +
    "3. Press Play to run the SampleScene.\n";

  const manifest = {
    dependencies: {
      "com.unity.collab-proxy": "1.17.7",
      "com.unity.ide.rider": "3.0.24",
      "com.unity.ide.visualstudio": "2.0.22",
      "com.unity.ide.vscode": "1.2.5",
      "com.unity.test-framework": "1.3.9",
      "com.unity.textmeshpro": "3.0.6",
      "com.unity.timeline": "1.7.6",
      "com.unity.ugui": "1.0.0",
      "com.unity.modules.ai": "1.0.0",
      "com.unity.modules.animation": "1.0.0",
      "com.unity.modules.audio": "1.0.0",
      "com.unity.modules.physics": "1.0.0",
      "com.unity.modules.ui": "1.0.0"
    }
  };

  const sampleScene = `%
YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!29 &1
Scene:
  m_ObjectHideFlags: 0
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_RootOrder: 0
  m_EditorData: {}
  m_Entities:
  - {fileID: 2}
  - {fileID: 4}
--- !u!1 &2
GameObject:
  m_Component:
  - component: {fileID: 3}
  m_Name: Main Camera
--- !u!20 &3
Camera:
  m_ClearFlags: 1
  m_BackGroundColor: {r: 0.19215687, g: 0.3019608, b: 0.4745098, a: 0}
  near clip plane: 0.3
  far clip plane: 1000
--- !u!1 &4
GameObject:
  m_Component:
  - component: {fileID: 5}
  m_Name: Directional Light
--- !u!108 &5
Light:
  m_Type: 1
  m_Color: {r: 1, g: 0.95686275, b: 0.8392157, a: 1}
`;

  return [
    {
      path: "README.md",
      content: readme
    },
    {
      path: "ProjectSettings/ProjectVersion.txt",
      content:
        "m_EditorVersion: 2022.3.0f1\nm_EditorVersionWithRevision: 2022.3.0f1 (1234567890abcdef)\n"
    },
    {
      path: "Packages/manifest.json",
      content: JSON.stringify(manifest, null, 2) + "\n"
    },
    {
      path: "Assets/Scenes/SampleScene.unity",
      content: sampleScene
    },
    {
      path: "Assets/Scenes.meta",
      content:
        "fileFormatVersion: 2\nGUID: 00000000000000000000000000000000\nfolderAsset: yes\n"
    },
    {
      path: "Assets/Scenes/SampleScene.unity.meta",
      content:
        "fileFormatVersion: 2\nGUID: 11111111111111111111111111111111\n"
    }
  ];
};

function sanitizeProjectName(rawName) {
  if (typeof rawName !== "string") {
    return DEFAULT_PROJECT_NAME;
  }
  const normalized = rawName.trim().replace(/[^A-Za-z0-9_-]+/g, "-");
  const cleaned = normalized.replace(/^-+|-+$/g, "");
  return cleaned || DEFAULT_PROJECT_NAME;
}

async function writeTemplateZip(zipPath, files) {
  await mkdir(path.dirname(zipPath), { recursive: true });

  await new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);

    files.forEach((file) => {
      archive.append(file.content, { name: file.path });
    });

    archive.finalize();
  });
}

const execFileAsync = promisify(execFile);
const app = express();
app.use(express.json({ limit: "2mb" }));

app.post("/export", async (req, res) => {
  try {
    const result = await exportUnityProject({
      ...req.body,
      outputDir: path.join(process.cwd(), "downloads"),
    });
    res.json({
      ok: true,
      path: result.zipPath,
      projectFolder: result.projectFolder,
      bytes: result.bytes,
      files: result.files,
      metadata: result.metadata,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ ok: false, error: message });
app.post("/export", async (_req, res) => {
const DEFAULT_PROJECT_NAME = "BlackRoadUnitySample";
const DEFAULT_SCENE_NAME = "SampleScene";
const DEFAULT_SCRIPT_NAME = "HelloBlackRoad";

function createDefaultScript(scriptName) {
  return `using UnityEngine;

public class ${scriptName} : MonoBehaviour
{
    void Start()
    {
        Debug.Log("BlackRoad Unity exporter generated project ready!");
    }
}
`;
}

const DEFAULT_SCENE = `# BlackRoad Unity Scene Placeholder
# Open in Unity and add objects to build out your world.
`;

const PROJECT_VERSION = `m_EditorVersion: 2022.3.15f1
m_EditorVersionWithRevision: 2022.3.15f1 (bce4550a1dad)
`;

const PACKAGE_MANIFEST = JSON.stringify(
  {
    dependencies: {
      "com.unity.collab-proxy": "1.17.7",
      "com.unity.ide.rider": "3.0.21",
      "com.unity.ide.visualstudio": "2.0.22",
      "com.unity.ide.vscode": "1.2.5",
      "com.unity.test-framework": "1.1.33",
      "com.unity.textmeshpro": "3.0.6",
      "com.unity.timeline": "1.7.4",
      "com.unity.ugui": "1.0.0",
      "com.unity.modules.ai": "1.0.0",
      "com.unity.modules.animation": "1.0.0",
      "com.unity.modules.audio": "1.0.0",
      "com.unity.modules.imgui": "1.0.0",
      "com.unity.modules.physics": "1.0.0",
      "com.unity.modules.physics2d": "1.0.0",
      "com.unity.modules.tilemap": "1.0.0",
      "com.unity.modules.ui": "1.0.0",
      "com.unity.modules.unitywebrequest": "1.0.0"
    }
  },
  null,
  2
);

function sanitizeFolderName(name, fallback) {
  const normalized =
    (name ?? "")
      .toString()
      .trim()
      .replace(/[^A-Za-z0-9-_]+/g, "-") || fallback;
  return normalized.length ? normalized : fallback;
}

function sanitizeIdentifier(name, fallback) {
  const normalized =
    (name ?? "")
      .toString()
      .trim()
      .replace(/[^A-Za-z0-9_]+/g, "") || fallback;
  return normalized.length ? normalized : fallback;
}

async function createUnityTemplate(projectRoot, options) {
  const {
    projectName,
    sceneName,
    scriptName,
    scriptContents,
    sceneContents
  } = options;

  const assetsDir = path.join(projectRoot, "Assets");
  const scriptsDir = path.join(assetsDir, "Scripts");
  const scenesDir = path.join(assetsDir, "Scenes");
  const packagesDir = path.join(projectRoot, "Packages");
  const settingsDir = path.join(projectRoot, "ProjectSettings");

  await Promise.all([
    mkdir(scriptsDir, { recursive: true }),
    mkdir(scenesDir, { recursive: true }),
    mkdir(packagesDir, { recursive: true }),
    mkdir(settingsDir, { recursive: true })
  ]);

  const scriptFile = path.join(scriptsDir, `${scriptName}.cs`);
  const sceneFile = path.join(scenesDir, `${sceneName}.unity`);
  const packageManifest = path.join(packagesDir, "manifest.json");
  const projectVersion = path.join(settingsDir, "ProjectVersion.txt");
  const projectReadme = path.join(projectRoot, "README.md");

  await Promise.all([
    writeFile(
      scriptFile,
      scriptContents ?? createDefaultScript(scriptName),
      "utf8"
    ),
    writeFile(sceneFile, sceneContents ?? DEFAULT_SCENE, "utf8"),
    writeFile(packageManifest, PACKAGE_MANIFEST, "utf8"),
    writeFile(projectVersion, PROJECT_VERSION, "utf8"),
    writeFile(
      projectReadme,
      `# ${projectName}\n\nGenerated by the BlackRoad Unity exporter.\n`,
      "utf8"
    )
  ]);
}

app.post("/export", async (req, res) => {
  const body = req.body ?? {};

  const projectName = sanitizeFolderName(
    body.projectName,
    DEFAULT_PROJECT_NAME
  );
  const sceneName = sanitizeFolderName(body.sceneName, DEFAULT_SCENE_NAME);
  const scriptName = sanitizeIdentifier(
    body.scriptName,
    DEFAULT_SCRIPT_NAME
  );

  const outDir = path.join(process.cwd(), "downloads");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const archiveName = `${projectName}-${timestamp}.zip`;
  const zipPath = path.join(outDir, archiveName);

  let tempRoot;
  try {
    await mkdir(outDir, { recursive: true });

    tempRoot = await mkdtemp(path.join(os.tmpdir(), "unity-exporter-"));
    const projectRoot = path.join(tempRoot, projectName);
    await mkdir(projectRoot, { recursive: true });

    await createUnityTemplate(projectRoot, {
      projectName,
      sceneName,
      scriptName,
      scriptContents: body.scriptContents,
      sceneContents: body.sceneContents
    });

    await rm(zipPath, { force: true });
    await execFileAsync("zip", ["-r", zipPath, projectName], {
      cwd: tempRoot
const archiveTemplate = async ({ files, slug }) => {
  const outDir = path.join(process.cwd(), "downloads");
  await mkdir(outDir, { recursive: true });
  const fileName = `${slug}-${Date.now()}-${crypto
    .randomBytes(3)
    .toString("hex")}.zip`;
  const zipPath = path.join(outDir, fileName);

  await new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);
    files.forEach((file) => {
      archive.append(file.content, { name: file.path });
    });
    archive.finalize();
  });

  return { zipPath, fileName };
};

app.post("/export", async (req, res) => {
  try {
    const template = buildUnityTemplate(req.body ?? {});
    const { zipPath, fileName } = await archiveTemplate({
      files: template.files,
      slug: template.slug,
app.use(express.json({ limit: "1mb" }));

const DEFAULT_SCENES = [
  {
    name: "SampleScene",
    description: "Starter layout with a rotating cube and directional light.",
    camera: {
      position: { x: 0, y: 1.2, z: -4 },
      rotation: { x: 10, y: 0, z: 0 },
    },
    rotationSpeed: 30,
  },
];

const sanitizeForPath = (value, fallback) => {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }
  const sanitized = trimmed.replace(/[^A-Za-z0-9_-]+/g, "_");
  return sanitized || fallback;
};

const makeGuid = () => crypto.randomUUID().replace(/-/g, "").toLowerCase();

const DEG2RAD = Math.PI / 180;
const eulerToQuaternion = ({ x = 0, y = 0, z = 0 }) => {
  const halfX = (x * DEG2RAD) / 2;
  const halfY = (y * DEG2RAD) / 2;
  const halfZ = (z * DEG2RAD) / 2;

  const sinX = Math.sin(halfX);
  const cosX = Math.cos(halfX);
  const sinY = Math.sin(halfY);
  const cosY = Math.cos(halfY);
  const sinZ = Math.sin(halfZ);
  const cosZ = Math.cos(halfZ);

  const quaternion = {
    x: sinX * cosY * cosZ + cosX * sinY * sinZ,
    y: cosX * sinY * cosZ - sinX * cosY * sinZ,
    z: cosX * cosY * sinZ + sinX * sinY * cosZ,
    w: cosX * cosY * cosZ - sinX * sinY * sinZ,
  };

  const magnitude = Math.hypot(quaternion.x, quaternion.y, quaternion.z, quaternion.w) || 1;

  return {
    x: quaternion.x / magnitude,
    y: quaternion.y / magnitude,
    z: quaternion.z / magnitude,
    w: quaternion.w / magnitude,
  };
};

const ensureScenes = (scenes) => {
  const candidates = Array.isArray(scenes) ? scenes : [];
  const normalized = candidates
    .map((scene, index) => {
      if (!scene || typeof scene !== "object") {
        return null;
      }
      const rawName =
        typeof scene.name === "string" && scene.name.trim()
          ? scene.name.trim()
          : `Scene${index + 1}`;
      const fileName = `${sanitizeForPath(rawName, `Scene${index + 1}`)}.unity`;
      const guid =
        typeof scene.guid === "string" && /^[a-f0-9]{32}$/i.test(scene.guid)
          ? scene.guid.toLowerCase()
          : makeGuid();
      return {
        name: rawName,
        fileName,
        guid,
        description:
          typeof scene.description === "string" && scene.description.trim()
            ? scene.description.trim()
            : "Generated scene stub created by the BlackRoad Unity exporter.",
        camera: {
          position: {
            x: Number(scene?.camera?.position?.x ?? 0),
            y: Number(scene?.camera?.position?.y ?? 1),
            z: Number(scene?.camera?.position?.z ?? -10),
          },
          rotation: {
            x: Number(scene?.camera?.rotation?.x ?? 0),
            y: Number(scene?.camera?.rotation?.y ?? 0),
            z: Number(scene?.camera?.rotation?.z ?? 0),
          },
        },
        rotationSpeed: Number.isFinite(scene?.rotationSpeed)
          ? Number(scene.rotationSpeed)
          : 45,
      };
    })
    .filter(Boolean);

  if (normalized.length > 0) {
    return normalized;
  }

  return DEFAULT_SCENES.map((scene, index) => ({
    ...scene,
    fileName: `${sanitizeForPath(scene.name, `Scene${index + 1}`)}.unity`,
    guid: makeGuid(),
  }));
};

const renderSceneUnity = (scene, bootstrapGuid) => {
  const { position, rotation } = scene.camera;
  const quaternion = eulerToQuaternion(rotation);
  return `// ${scene.name}.unity\n// ${scene.description}\n%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:\n--- !u!1 &1000\nGameObject:\n  m_ObjectHideFlags: 0\n  m_Name: Main Camera\n  m_Component:\n  - component: {fileID: 1001}\n  - component: {fileID: 1002}\n  - component: {fileID: 1003}\n  m_Transform: {fileID: 1004}\n--- !u!20 &1001\nCamera:\n  m_ObjectHideFlags: 0\n  m_GameObject: {fileID: 1000}\n  field of view: 60\n  m_FocalLength: 50\n  near clip plane: 0.3\n  far clip plane: 1000\n--- !u!81 &1002\nAudioListener:\n  m_ObjectHideFlags: 0\n  m_GameObject: {fileID: 1000}\n--- !u!92 &1003\nBehaviour:\n  m_ObjectHideFlags: 0\n  m_GameObject: {fileID: 1000}\n--- !u!4 &1004\nTransform:\n  m_ObjectHideFlags: 0\n  m_GameObject: {fileID: 1000}\n  m_LocalPosition: {x: ${position.x.toFixed(2)}, y: ${position.y.toFixed(2)}, z: ${position.z.toFixed(2)}}\n  m_LocalRotation: {x: ${quaternion.x.toFixed(6)}, y: ${quaternion.y.toFixed(6)}, z: ${quaternion.z.toFixed(6)}, w: ${quaternion.w.toFixed(6)}}\n  m_LocalScale: {x: 1, y: 1, z: 1}\n--- !u!1 &2000\nGameObject:\n  m_ObjectHideFlags: 0\n  m_Name: Scene Bootstrap\n  m_Component:\n  - component: {fileID: 2001}\n  m_Transform: {fileID: 2002}\n--- !u!4 &2002\nTransform:\n  m_ObjectHideFlags: 0\n  m_GameObject: {fileID: 2000}\n  m_LocalPosition: {x: 0, y: 0, z: 0}\n  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}\n  m_LocalScale: {x: 1, y: 1, z: 1}\n--- !u!114 &2001\nMonoBehaviour:\n  m_ObjectHideFlags: 0\n  m_GameObject: {fileID: 2000}\n  m_Script: {fileID: 11500000, guid: ${bootstrapGuid}, type: 3}\n  m_Name: SceneBootstrap\n  m_EditorClassIdentifier: \n  sceneLabel: ${scene.name}\n  sceneDescription: ${scene.description}\n  rotationSpeed: ${scene.rotationSpeed}\n`;
};

const renderSceneMeta = (guid) => `fileFormatVersion: 2\nguid: ${guid}\nSceneImporter:\n  externalObjects: {}\n  userData: \n  assetBundleName: \n  assetBundleVariant: \n`;

const renderBootstrapScript = () => `using UnityEngine;\n\npublic class Bootstrap : MonoBehaviour\n{\n    [SerializeField]\n    private string sceneLabel = \"Generated Scene\";\n\n    [SerializeField, TextArea(2, 6)]\n    private string sceneDescription = \"\";\n\n    [SerializeField]\n    private float rotationSpeed = 45f;\n\n    private GameObject demoCube;\n\n    private void Start()\n    {\n        Debug.Log($\"[BlackRoad] Loaded scene '{sceneLabel}' - {sceneDescription}\");\n\n        demoCube = GameObject.CreatePrimitive(PrimitiveType.Cube);\n        demoCube.name = \"BlackRoadDemoCube\";\n        demoCube.transform.position = new Vector3(0f, 0.5f, 0f);\n        var material = new Material(Shader.Find(\"Universal Render Pipeline/Lit\"));\n        material.color = new Color(0.2f, 0.6f, 0.9f);\n        var renderer = demoCube.GetComponent<Renderer>();\n        if (renderer != null)\n        {\n            renderer.material = material;\n        }\n    }\n\n    private void Update()\n    {\n        if (demoCube == null)\n        {\n            return;\n        }\n\n        demoCube.transform.Rotate(Vector3.up, rotationSpeed * Time.deltaTime, Space.World);\n    }\n}\n`;

const renderBootstrapMeta = (guid) => `fileFormatVersion: 2\nguid: ${guid}\nMonoImporter:\n  externalObjects: {}\n  serializedVersion: 2\n  defaultReferences: []\n  executionOrder: 0\n  icon: {instanceID: 0}\n  userData: \n  assetBundleName: \n  assetBundleVariant: \n`;

const renderPackagesManifest = () =>
  `${JSON.stringify(
    {
      dependencies: {
        "com.unity.collab-proxy": "2.0.5",
        "com.unity.ide.visualstudio": "2.0.22",
        "com.unity.ide.vscode": "1.2.5",
        "com.unity.render-pipelines.universal": "14.0.8",
        "com.unity.test-framework": "1.3.6",
        "com.unity.textmeshpro": "3.0.6",
        "com.unity.timeline": "1.7.6",
        "com.unity.ugui": "1.0.0",
        "com.unity.modules.ai": "1.0.0",
        "com.unity.modules.animation": "1.0.0",
        "com.unity.modules.audio": "1.0.0",
        "com.unity.modules.physics": "1.0.0",
        "com.unity.modules.physics2d": "1.0.0",
        "com.unity.modules.particlesystem": "1.0.0",
        "com.unity.modules.ui": "1.0.0",
        "com.unity.modules.unitywebrequest": "1.0.0",
      },
    },
    null,
    2
  )}\n`;

const renderEditorBuildSettings = (scenes) => {
  const sceneLines = scenes
    .map(
      (scene) =>
        `  - enabled: 1\n    path: Assets/Scenes/${scene.fileName}\n    guid: ${scene.guid}`
    )
    .join("\n");

  return `%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:\n--- !u!1045 &1\nEditorBuildSettings:\n  m_ObjectHideFlags: 0\n  serializedVersion: 2\n  m_Scenes:\n${sceneLines}\n  m_configObjects: {}\n`;
};

const renderProjectVersion = () => `m_EditorVersion: 2022.3.21f1\nm_EditorVersionWithRevision: 2022.3.21f1 (b1234567890ab)\n`;

const renderReadme = (projectName, description, scenes, generatedAt) => {
  const sceneList = scenes
    .map((scene) => `- ${scene.name} → Assets/Scenes/${scene.fileName}`)
    .join("\n");

  return `# ${projectName}\n\n${description || "Unity project exported via the BlackRoad pipeline."}\n\n## Scenes\n${sceneList}\n\nGenerated at ${generatedAt}.\n`;
};

app.post("/export", async (req, res) => {
  const { projectName = "BlackRoadUnityPrototype", description = "", scenes } = req.body ?? {};
  const normalizedScenes = ensureScenes(scenes);
  const generatedAt = new Date().toISOString();
  const outDir = path.join(process.cwd(), "downloads");
  const safeFolderName = sanitizeForPath(projectName, "BlackRoadUnityProject");
  const timestamp = generatedAt.replace(/[:.]/g, "-");
  const zipFileName = `${safeFolderName}-${timestamp}.zip`;
  const zipPath = path.join(outDir, zipFileName);
  const bootstrapGuid = makeGuid();

  try {
    await mkdir(outDir, { recursive: true });
    const archive = archiver("zip", { zlib: { level: 9 } });
    const output = createWriteStream(zipPath);
    archive.pipe(output);

    const projectMetadata = {
      name: projectName,
      description,
      generatedAt,
      scenes: normalizedScenes,
    };

    archive.append(renderPackagesManifest(), {
      name: `${safeFolderName}/Packages/manifest.json`,
    });
    archive.append(renderProjectVersion(), {
      name: `${safeFolderName}/ProjectSettings/ProjectVersion.txt`,
    });
    archive.append(renderEditorBuildSettings(normalizedScenes), {
      name: `${safeFolderName}/ProjectSettings/EditorBuildSettings.asset`,
    });

    const bootstrapScriptPath = `${safeFolderName}/Assets/Scripts/Bootstrap.cs`;
    archive.append(renderBootstrapScript(), { name: bootstrapScriptPath });
    archive.append(renderBootstrapMeta(bootstrapGuid), {
      name: `${bootstrapScriptPath}.meta`,
    });

    normalizedScenes.forEach((scene) => {
      archive.append(renderSceneUnity(scene, bootstrapGuid), {
        name: `${safeFolderName}/Assets/Scenes/${scene.fileName}`,
      });
      archive.append(renderSceneMeta(scene.guid), {
        name: `${safeFolderName}/Assets/Scenes/${scene.fileName}.meta`,
      });
    });

    archive.append(JSON.stringify(projectMetadata, null, 2) + "\n", {
      name: `${safeFolderName}/blackroad_export.json`,
    });
    archive.append(renderReadme(projectName, description, normalizedScenes, generatedAt), {
      name: `${safeFolderName}/README.md`,
    });

    await new Promise((resolve, reject) => {
      output.on("close", resolve);
      output.on("error", reject);
      archive.on("error", reject);
      archive.finalize();
    });
const DEFAULT_PROJECT_NAME = "BlackRoadUnity";
const DEFAULT_DESCRIPTION =
  "Starter Unity project generated by the BlackRoad exporter.";
const DEFAULT_SCENES = ["SampleScene"];
const UNITY_VERSION = "2022.3.36f1";
const UNITY_VERSION_WITH_REVISION = `${UNITY_VERSION} (000000000000)`;

const sanitizeProjectName = (name) => {
  if (typeof name !== "string") return DEFAULT_PROJECT_NAME;
  const trimmed = name.trim();
  if (!trimmed) return DEFAULT_PROJECT_NAME;
  const normalized = trimmed
    .replace(/[^A-Za-z0-9-_\s]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized ? normalized.slice(0, 64) : DEFAULT_PROJECT_NAME;
};

const sanitizeSceneName = (name) => {
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  const normalized = trimmed
    .replace(/[^A-Za-z0-9-_\s]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || null;
};

const normalizeScenes = (scenes) => {
  if (scenes === undefined) return DEFAULT_SCENES;
  if (!Array.isArray(scenes)) return null;
  const deduped = new Set();
  for (const entry of scenes) {
    let candidate = entry;
    if (entry && typeof entry === "object" && typeof entry.name === "string") {
      candidate = entry.name;
    }
    const sanitized = sanitizeSceneName(candidate);
    if (sanitized) {
      deduped.add(sanitized);
    }
  }
  return deduped.size > 0 ? Array.from(deduped) : DEFAULT_SCENES;
};

const projectReadme = (projectName, description, scenes) => {
  const sceneList = scenes.map((scene) => `- Assets/Scenes/${scene}.unity`).join("\n");
  return `# ${projectName}\n\n${description}\n\n## Included Scenes\n${sceneList}\n\nGenerated on ${new Date().toISOString()} by the Unity exporter service.`;
};

const manifestJson = `{
  "dependencies": {
    "com.unity.collab-proxy": "2.0.5",
    "com.unity.ide.rider": "3.0.24",
    "com.unity.ide.visualstudio": "2.0.22",
    "com.unity.test-framework": "1.3.9",
    "com.unity.textmeshpro": "3.0.6",
    "com.unity.timeline": "1.7.5",
    "com.unity.ugui": "1.0.0",
    "com.unity.visualscripting": "1.9.4"
  }
}`;

const projectVersionFile = () =>
  `m_EditorVersion: ${UNITY_VERSION}\nm_EditorVersionWithRevision: ${UNITY_VERSION_WITH_REVISION}\n`; // newline at end of file expected by Unity

const editorBuildSettings = (scenes) => {
  const sceneEntries = scenes
    .map(
      (scene) => `  - enabled: 1\n    path: Assets/Scenes/${scene}.unity\n    guid: ${randomUUID().replace(/-/g, "")}`,
    )
    .join("\n");
  return `%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:\n--- !u!1045 &1\nEditorBuildSettings:\n  m_ObjectHideFlags: 0\n  serializedVersion: 2\n  m_Scenes:\n${sceneEntries}\n  m_configObjects: {}\n`;
};

const defaultSceneContent = (scene) => `// ${scene}.unity\n// Placeholder scene generated by the BlackRoad Unity exporter.\n// Open this project in Unity to replace it with a real scene.\n`;

app.post("/export", async (req, res) => {
  const {
    projectName: requestedProjectName,
    description = DEFAULT_DESCRIPTION,
    scenes: requestedScenes,
  } = req.body ?? {};

  const projectName = sanitizeProjectName(requestedProjectName);
  const scenes = normalizeScenes(requestedScenes);

  if (!scenes) {
    res
      .status(400)
      .json({ ok: false, error: "`scenes` must be an array of names or { name } objects." });
    return;
  }

  let stagingRoot;
import { mkdir } from "fs/promises";
import path from "path";
import archiver from "archiver";

const UNITY_VERSION = "2022.3.9f1";
const DEFAULT_EXPORT = {
  projectName: "BlackRoad Prism World",
  sceneName: "Gateway Plaza",
  description:
    "Starter Unity scene generated by the Prism exporter. Replace the placeholder assets and keep iterating!",
  author: "BlackRoad Studios"
};

const app = express();
app.use(express.json({ limit: "2mb" }));

app.post("/export", async (req, res) => {
  const config = normalizeExportOptions(req?.body);

  try {
    const downloadsDir = path.join(process.cwd(), "downloads");
    await mkdir(downloadsDir, { recursive: true });

    stagingRoot = await mkdtemp(path.join(tmpdir(), "unity-export-"));
    const projectRoot = path.join(stagingRoot, projectName);
    await mkdir(projectRoot, { recursive: true });

    const createdFiles = [];
    const writeRelativeFile = async (relativePath, contents) => {
      const targetPath = path.join(projectRoot, relativePath);
      await mkdir(path.dirname(targetPath), { recursive: true });
      await writeFile(targetPath, contents, "utf8");
      createdFiles.push(relativePath.replace(/\\/g, "/"));
    };

    await writeRelativeFile("README.md", projectReadme(projectName, description, scenes));
    await writeRelativeFile("Packages/manifest.json", `${manifestJson}\n`);
    await writeRelativeFile("ProjectSettings/ProjectVersion.txt", projectVersionFile());
    await writeRelativeFile(
      "ProjectSettings/EditorBuildSettings.asset",
      editorBuildSettings(scenes),
    );
    await writeRelativeFile(
      "Assets/Scripts/README.md",
      `# Scripts\n\nAdd your gameplay scripts in this folder.\n\nGenerated scenes:\n${scenes
        .map((scene) => `- ${scene}`)
        .join("\n")}\n`,
    );

    for (const scene of scenes) {
      await writeRelativeFile(`Assets/Scenes/${scene}.unity`, defaultSceneContent(scene));
    }

    const zipTempDir = stagingRoot;
    const zipTempPath = path.join(zipTempDir, `${projectName}.zip`);
    const zipTargetPath = path.join(
      downloadsDir,
      `${projectName}-${Date.now().toString(36)}.zip`,
    );

    try {
      await execFileAsync("zip", ["-r", zipTempPath, projectName], {
        cwd: zipTempDir,
      });
    } catch (error) {
      const stderr = error?.stderr?.toString() ?? "";
      throw new Error(`Failed to create zip archive: ${error.message || error}. ${stderr}`);
    }

    await rename(zipTempPath, zipTargetPath);

    res.json({
      ok: true,
      projectName,
      sceneName,
      scriptName,
      path: zipPath
    });
  } catch (error) {
    console.error("unity exporter error", error);
    res.status(500).json({ ok: false, error: String(error) });
  } finally {
    if (tempRoot) {
      try {
        await rm(tempRoot, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn("failed to clean up temp directory", cleanupError);
      }
    }
      output: zipPath,
      fileName,
      projectName: template.projectName,
      sceneName: template.sceneName,
      files: template.files.map((file) => file.path),
    });
  } catch (error) {
    console.error("Failed to export Unity project", error);
      path: zipPath,
      fileName: zipFileName,
      project: projectMetadata,
    });
  } catch (error) {
    console.error("Unity exporter failed", error);
    res.status(500).json({ ok: false, error: String(error) });
  writeFile,
  rm,
  stat
} from "fs/promises";
import os from "os";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

class ExportError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

const app = express();
app.use(express.json({ limit: "1mb" }));

app.post("/export", async (req, res) => {
  try {
    const { projectName, scenes, description } = req.body ?? {};
    const safeProjectName = sanitizeProjectName(projectName);
    const safeScenes = normalizeScenes(scenes);
    const exportInfo = await createUnityProject({
      projectName: safeProjectName,
      scenes: safeScenes,
      description: typeof description === "string" ? description.trim() : undefined
    });
    res.json({
      ok: true,
      ...exportInfo
    });
  } catch (error) {
    const status = error instanceof ExportError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Unity export failed", error);
    res.status(status).json({ ok: false, error: message });
import path from "path";
import { mkdir } from "fs/promises";

import {
  buildProjectSpec,
  exportUnityProject,
} from "./projectGenerator.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.post("/export", async (req, res) => {
  try {
    const spec = buildProjectSpec(req.body ?? {});
    const outDir = path.join(process.cwd(), "downloads");
    await mkdir(outDir, { recursive: true });

    const filename = `${spec.slug}-${Date.now()}.zip`;
    const zipPath = path.join(outDir, filename);
    await exportUnityProject(spec, zipPath);

    res.json({
      ok: true,
      projectName: spec.projectName,
      sceneName: spec.sceneName,
      objects: spec.objects.length,
      path: zipPath,
    });
  } catch (error) {
    const status = error?.statusCode ?? 500;
    res.status(status).json({
      ok: false,
      error: error?.message ?? String(error),
    });
      path: zipTargetPath,
      files: createdFiles.sort(),
    });
  } catch (error) {
    console.error("Unity export failed", error);
    res.status(500).json({ ok: false, error: error?.message || String(error) });
  } finally {
    if (stagingRoot) {
      try {
        await rm(stagingRoot, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn("Failed to clean up staging directory", cleanupError);
      }
    }
  try {
    const {
      projectName: rawProjectName,
      sceneName: rawSceneName,
      description,
    } = req.body ?? {};

    const projectName = sanitizeName(rawProjectName, DEFAULT_PROJECT_NAME);
    const sceneName = sanitizeName(rawSceneName, DEFAULT_SCENE_NAME);

    const downloadsDir = path.join(process.cwd(), "downloads");
    await mkdir(downloadsDir, { recursive: true });

    const zipPath = path.join(
      downloadsDir,
      `${projectName}-${Date.now()}.zip`,
    );

    await createUnityProjectZip({
      projectName,
      sceneName,
      description,
      zipPath,
const DEFAULT_PROJECT_NAME = "SampleUnityProject";
const DEFAULT_SCENE_NAME = "SampleScene";
const DEFAULT_SCRIPT_NAME = "OrbitingCube";

const projectFilesTemplate = ({ projectName, sceneName, scriptName }) => ({
  "README.md": `# ${projectName}\n\nThis archive contains a ready-to-open Unity project scaffold.\n\n## Quick start\n1. Unzip the archive.\n2. Open the folder with Unity Hub (recommended Unity 2022.3 LTS or newer).\n3. Open **Assets/Scenes/${sceneName}.unity** and press Play.\n\nThe scene contains an empty stage with a rotating cube behaviour defined in \`Assets/Scripts/${scriptName}.cs\`.\n`,
  "ProjectSettings/ProjectVersion.txt": "m_EditorVersion: 2022.3.22f1\n",
  "ProjectSettings/ProjectSettings.asset": `%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:\n--- !u!129 &1\nPlayerSettings:\n  m_ObjectHideFlags: 0\n  serializedVersion: 24\n  companyName: BlackRoad\n  productName: ${projectName}\n  defaultScreenWidth: 1920\n  defaultScreenHeight: 1080\n  m_DefaultScreenOrientation: 4\n  fullscreenMode: 1\n`,
  "Packages/manifest.json":
    JSON.stringify(
      {
        dependencies: {
          "com.unity.collab-proxy": "2.0.5",
          "com.unity.ide.rider": "3.0.28",
          "com.unity.ide.visualstudio": "2.0.22",
          "com.unity.ide.vscode": "1.2.5",
          "com.unity.render-pipelines.universal": "14.0.11",
          "com.unity.test-framework": "1.3.9",
          "com.unity.textmeshpro": "3.0.6",
          "com.unity.timeline": "1.8.6",
          "com.unity.ugui": "1.0.0",
          "com.unity.modules.ai": "1.0.0",
          "com.unity.modules.animation": "1.0.0",
          "com.unity.modules.audio": "1.0.0",
          "com.unity.modules.imgui": "1.0.0",
          "com.unity.modules.jsonserialize": "1.0.0",
          "com.unity.modules.physics": "1.0.0",
          "com.unity.modules.physics2d": "1.0.0",
          "com.unity.modules.ui": "1.0.0",
        },
      },
      null,
      2,
    ) + "\n",
  "Packages/packages-lock.json":
    JSON.stringify(
      {
        dependencies: {
          "com.unity.render-pipelines.universal": {
            version: "14.0.11",
            depth: 0,
            source: "registry",
            dependencies: {
              "com.unity.render-pipelines.core": "14.0.11",
              "com.unity.shadergraph": "14.0.11",
            },
          },
        },
      },
      null,
      2,
    ) + "\n",
  [`Assets/Scenes/${sceneName}.unity`]: `%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:\n--- !u!1 &1000\nGameObject:\n  m_ObjectHideFlags: 0\n  m_Component:\n  - component: {fileID: 2000}\n  - component: {fileID: 3000}\n  m_Layer: 0\n  m_Name: Main Camera\n  m_TagString: MainCamera\n  m_IsActive: 1\n--- !u!20 &2000\nCamera:\n  m_ObjectHideFlags: 0\n  m_GameObject: {fileID: 1000}\n  m_ClearFlags: 1\n  m_projectionMatrixMode: 1\n  near clip plane: 0.3\n  far clip plane: 1000\n  field of view: 60\n  orthographic size: 5\n--- !u!81 &3000\nAudioListener:\n  m_ObjectHideFlags: 0\n  m_GameObject: {fileID: 1000}\n--- !u!1 &4000\nGameObject:\n  m_ObjectHideFlags: 0\n  m_Component:\n  - component: {fileID: 5000}\n  - component: {fileID: 6000}\n  m_Layer: 0\n  m_Name: Rotating Cube\n  m_IsActive: 1\n--- !u!4 &5000\nTransform:\n  m_ObjectHideFlags: 0\n  m_GameObject: {fileID: 4000}\n  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}\n  m_LocalPosition: {x: 0, y: 0, z: 0}\n  m_LocalScale: {x: 1, y: 1, z: 1}\n--- !u!65 &6000\nBoxCollider:\n  m_ObjectHideFlags: 0\n  m_GameObject: {fileID: 4000}\n--- !u!114 &7000\nMonoBehaviour:\n  m_ObjectHideFlags: 0\n  m_GameObject: {fileID: 4000}\n  m_Script: {fileID: 0}\n  m_Name: ${scriptName}\n  m_EditorClassIdentifier: \n  m_Enabled: 1\n  serializedVersion: 1\n  m_ComponentHideFlags: 0\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n# NOTE: Attach the ${scriptName} script in Unity to enable runtime behaviour.\n`,
  [`Assets/Scripts/${scriptName}.cs`]: `using UnityEngine;\n\npublic class ${scriptName} : MonoBehaviour\n{\n    [SerializeField] private float rotationSpeed = 45f;\n\n    private void Start()\n    {\n        Debug.Log("${projectName} loaded. ${sceneName} is ready.");\n    }\n\n    private void Update()\n    {\n        transform.Rotate(Vector3.up, rotationSpeed * Time.deltaTime, Space.World);\n    }\n}\n`,
  "Assets/Scenes/README.txt": `This directory contains the default scene generated for ${projectName}.\n\nOpen ${sceneName}.unity inside the Unity editor. If the ${scriptName} behaviour is not linked automatically, drag Assets/Scripts/${scriptName}.cs onto the Rotating Cube in the hierarchy.\n`,
});

function sanitizeProjectName(name) {
  if (typeof name !== "string") return DEFAULT_PROJECT_NAME;
  const trimmed = name.trim().replace(/[^A-Za-z0-9_-]+/g, "-").replace(/-+/g, "-");
  return trimmed || DEFAULT_PROJECT_NAME;
}

function sanitizeUnityIdentifier(name, fallback) {
  if (typeof name !== "string") return fallback;
  const cleaned = name.replace(/[^A-Za-z0-9_]+/g, "").replace(/^[0-9_]+/, "");
  return cleaned || fallback;
}

function buildProjectFiles(options) {
  const sceneName = sanitizeUnityIdentifier(options.sceneName, DEFAULT_SCENE_NAME);
  const scriptName = sanitizeUnityIdentifier(options.scriptName, DEFAULT_SCRIPT_NAME);
  return {
    files: projectFilesTemplate({ ...options, sceneName, scriptName }),
    sceneName,
    scriptName,
  };
}

async function writeUnityArchive(zipPath, options) {
  const { files, sceneName, scriptName } = buildProjectFiles(options);
  const output = createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on("close", () => resolve({ sceneName, scriptName }));
    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);

    Object.entries(files).forEach(([relativePath, content]) => {
      const normalized = path.posix.join(options.projectName, relativePath.replace(/\\/g, "/"));
      archive.append(content, { name: normalized });
    });

    archive.finalize();
  });
}

app.post("/export", async (req, res) => {
  try {
    const projectName = sanitizeProjectName(req.body?.projectName);
    const outDir = path.join(process.cwd(), "downloads");
    await mkdir(outDir, { recursive: true });
    const zipFileName = `${projectName}-${Date.now()}.zip`;
    const zipPath = path.join(outDir, zipFileName);

    const { sceneName, scriptName } = await writeUnityArchive(zipPath, {
      projectName,
      sceneName: req.body?.sceneName,
      scriptName: req.body?.scriptName,
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateDir = path.join(__dirname, "template");
const downloadsDir = path.join(__dirname, "downloads");

const TEXT_EXTENSIONS = new Set([
  ".txt",
  ".json",
  ".unity",
  ".asset",
  ".meta",
  ".md",
  ".yaml",
  ".yml",
]);

function sanitizeName(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
app.use(express.json({ limit: "1mb" }));

const DEFAULT_PROJECT_NAME = "BlackRoadUnityProject";
const DEFAULT_VERSION = "2022.3.10f1";
const DEFAULT_PIPELINE = "builtin";
const DEFAULT_TEMPLATE = "core";
const UNITY_VERSION_PATTERN = /^[A-Za-z0-9.]+$/;

class BadRequestError extends Error {}

const PIPELINE_PACKAGES = {
  builtin: {
    dependencies: {},
    summary: "Unity Built-in Render Pipeline",
  },
  urp: {
    dependencies: {
      "com.unity.render-pipelines.universal": "14.0.11",
    },
    summary: "Universal Render Pipeline tuned for cross-platform builds",
  },
  hdrp: {
    dependencies: {
      "com.unity.render-pipelines.high-definition": "14.0.11",
    },
    summary: "High Definition Render Pipeline for cinematic visuals",
  },
};

const BASE_DEPENDENCIES = {
  "com.unity.collab-proxy": "2.0.5",
  "com.unity.ide.visualstudio": "2.0.22",
  "com.unity.ide.vscode": "1.2.5",
  "com.unity.timeline": "1.7.5",
  "com.unity.cinemachine": "2.9.7",
};

function sanitizeProjectName(projectName) {
  if (typeof projectName !== "string" || projectName.trim() === "") {
    return DEFAULT_PROJECT_NAME;
  }
  return projectName.trim().replace(/[^a-zA-Z0-9_-]+/g, "-");
}

function sanitizeUnityVersion(version) {
  const trimmed = typeof version === "string" ? version.trim() : "";
  if (trimmed === "") {
    return null;
  }
  if (!UNITY_VERSION_PATTERN.test(trimmed)) {
    throw new BadRequestError("Unity versions may only include letters, numbers, and dots.");
  }
  return trimmed;
}

function coerceVersions(unityVersions) {
  const normalized = [];
  if (Array.isArray(unityVersions) && unityVersions.length > 0) {
    for (const version of unityVersions) {
      const sanitized = sanitizeUnityVersion(version);
      if (sanitized) {
        normalized.push(sanitized);
      }
    }
  } else if (typeof unityVersions === "string" || unityVersions instanceof String) {
    const sanitized = sanitizeUnityVersion(unityVersions);
    if (sanitized) {
      normalized.push(sanitized);
    }
  }

  if (normalized.length > 0) {
    return normalized;
  }
  return [DEFAULT_VERSION];
}

function normalizePipeline(pipeline) {
  const requested = typeof pipeline === "string" ? pipeline.toLowerCase() : "";
  if (requested in PIPELINE_PACKAGES) {
    return requested;
  }
  return DEFAULT_PIPELINE;
}

function manifestForPipeline(pipeline) {
  const selected = PIPELINE_PACKAGES[pipeline] ?? PIPELINE_PACKAGES[DEFAULT_PIPELINE];
  const deps = { ...BASE_DEPENDENCIES, ...selected.dependencies };
  return `${JSON.stringify(
    {
      dependencies: deps,
    },
    null,
    2,
  )}
`;
}

function projectVersionFile(version) {
  return `m_EditorVersion: ${version}
m_EditorVersionWithRevision: ${version} (blackroad-unity-exporter)
`;
}

function projectSettingsAsset(projectName, pipeline) {
  return `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!129 &1
PlayerSettings:
  m_ObjectHideFlags: 0
  serializedVersion: 23
  productName: ${projectName}
  companyName: BlackRoad
  organizationId: blackroad
  defaultScreenWidth: 1920
  defaultScreenHeight: 1080
  runInBackground: 1
  visibleInBackground: 1
  bundleVersion: 0.1.0
  activeColorSpace: 1
  renderingPath: ${pipeline === "hdrp" ? 3 : pipeline === "urp" ? 2 : 1}
  scriptingBackend: 1
  additionalCompilerArguments: -define:BLACKROAD_EXPORT
  unitySplashScreen: 0
  renderPipelineAsset: ${pipeline.toUpperCase()}_PIPELINE_PLACEHOLDER
`;
}

function placeholderScene({ projectName, pipeline, template }) {
  return `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!1 &1
GameObject:
  m_ObjectHideFlags: 0
  m_Name: ${projectName}Root
  m_Component:
  - component: {fileID: 4}
  m_Children: []
  m_Layer: 0
  m_IsActive: 1
--- !u!4 &4
Transform:
  m_ObjectHideFlags: 0
  m_GameObject: {fileID: 1}
  m_LocalPosition: {x: 0, y: 0, z: 0}
  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}
  m_LocalScale: {x: 1, y: 1, z: 1}
  m_Children: []
  m_Father: {fileID: 0}
  m_RootOrder: 0
  m_LocalEulerAnglesHint: {x: 0, y: 0, z: 0}
# Pipeline: ${pipeline}
# Template: ${template}
# Scene placeholder for BlackRoad Codex-driven workflows.
`;
}

function readmeForExport({ projectName, version, pipeline, template }) {
  const pipelineSummary = PIPELINE_PACKAGES[pipeline]?.summary ?? PIPELINE_PACKAGES[DEFAULT_PIPELINE].summary;
  return `# ${projectName} (Unity ${version})

This archive is generated by the Unity exporter stub to prime a ${pipelineSummary} project that Codex can extend.

## Contents
- ProjectSettings/ProjectVersion.txt pins the editor to **${version}** so Unity Hub selects the right install.
- Packages/manifest.json activates the ${pipelineSummary} dependencies plus core tooling.
- ProjectSettings/ProjectSettings.asset seeds quality defaults for desktop play mode.
- Assets/Scenes/${projectName}.unity is a placeholder scene tagged with the "${template}" template metadata.

## Next steps
1. Install Unity ${version} (or compatible) through Unity Hub and ensure the Editor path is registered.
2. Extract this archive into your workspace, then open it via **Unity Hub → Projects → Add project from disk**.
3. Use the prompts in \`codex/prompts/blackroad_high_impact_codex_prompts.prompt.md\` to have Codex scaffold gameplay systems, art passes, and simulation behaviors.
4. Commit the generated assets back to the BlackRoad repo and trigger any CI defined for Unity builds.

> Tip: keep both ${version} and ${DEFAULT_VERSION} on build agents so you can diff behavior between long-term support releases.
`;
}

app.post("/export", async (req, res) => {
  try {
    const { projectName, unityVersions, renderPipeline, template } = req.body ?? {};
    const safeProjectName = sanitizeProjectName(projectName);
    const pipeline = normalizePipeline(renderPipeline);
    const templateName = typeof template === "string" && template.trim() !== "" ? template.trim() : DEFAULT_TEMPLATE;
    const versions = coerceVersions(unityVersions);

    const outDir = path.join(process.cwd(), "downloads");
    await mkdir(outDir, { recursive: true });

    const exports = [];
    for (const version of versions) {
      const effectiveVersion = version || DEFAULT_VERSION;
      const zip = new JSZip();
      zip.file("ProjectSettings/ProjectVersion.txt", projectVersionFile(effectiveVersion));
      zip.file("ProjectSettings/ProjectSettings.asset", projectSettingsAsset(safeProjectName, pipeline));
      zip.file("Packages/manifest.json", manifestForPipeline(pipeline));
      zip.file(
        `Assets/Scenes/${safeProjectName}.unity`,
        placeholderScene({ projectName: safeProjectName, pipeline, template: templateName }),
      );
      zip.file(
        "README.md",
        readmeForExport({ projectName: safeProjectName, version: effectiveVersion, pipeline, template: templateName }),
      );

      const archive = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
      const zipFileName = `${safeProjectName}-${effectiveVersion}.zip`;
      const zipPath = path.join(outDir, zipFileName);
      await writeFile(zipPath, archive);
      exports.push({ version: effectiveVersion, path: zipPath });
    }

    res.json({
      ok: true,
      projectName: safeProjectName,
      renderPipeline: pipeline,
      template: templateName,
      exports,
    });
  } catch (error) {
    if (error instanceof BadRequestError) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }
    console.error("unity exporter failed", error);
    res.status(500).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
    const projectName = sanitizeProjectName(_req.body?.projectName);
    const description = _req.body?.description;
    const outDir = path.join(process.cwd(), "downloads");
    const zipPath = path.join(outDir, `${projectName}.zip`);
    const files = TEMPLATE_FILES(projectName, description);
    await writeTemplateZip(zipPath, files);
    res.json({
      ok: true,
      path: zipPath,
      projectName,
      files: files.map((file) => file.path)
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
  const normalized = trimmed.replace(/[^A-Za-z0-9_\- ]+/g, "");
  const withDashes = normalized.replace(/\s+/g, "-");
  return withDashes || fallback;
}

async function ensureTemplateAvailable() {
  try {
    const stats = await stat(templateDir);
    if (!stats.isDirectory()) {
      throw new Error("Unity template directory is not a folder");
    }
  } catch (error) {
    throw new Error(
      `Unity template missing at ${templateDir}: ${error.message || String(error)}`,
    );
  }
}

async function replacePlaceholders(filePath, replacements) {
  const extension = path.extname(filePath).toLowerCase();
  if (!TEXT_EXTENSIONS.has(extension)) {
    return;
  }
  const original = await readFile(filePath, "utf8");
  let updated = original;
  for (const [token, value] of Object.entries(replacements)) {
    if (updated.includes(token)) {
      updated = updated.split(token).join(value);
    }
  }
  if (updated !== original) {
    await writeFile(filePath, updated, "utf8");
  }
}

async function walkAndReplace(dir, replacements) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkAndReplace(entryPath, replacements);
    } else if (entry.isFile()) {
      await replacePlaceholders(entryPath, replacements);
    }
  }
}

async function createZipFromTemplate({ projectName, sceneName }) {
  await ensureTemplateAvailable();
  await mkdir(downloadsDir, { recursive: true });

  const tmpRoot = await mkdtemp(path.join(os.tmpdir(), "unity-export-"));
  const projectDir = path.join(tmpRoot, projectName);
  const replacements = {
    "{{PROJECT_NAME}}": projectName,
    "{{SCENE_NAME}}": sceneName,
  };

  try {
    await cp(templateDir, projectDir, { recursive: true });
    await walkAndReplace(projectDir, replacements);

    const zipPath = path.join(downloadsDir, `${projectName}.zip`);

    try {
      await execFileAsync("zip", ["-r", zipPath, projectName], { cwd: tmpRoot });
    } catch (error) {
      if (error && error.code === "ENOENT") {
        throw new Error(
          "zip command not found. Install the zip utility to enable Unity package exports.",
        );
      }
      throw error;
    }

    return zipPath;
  } finally {
    await rm(tmpRoot, { recursive: true, force: true });
  try {
    const requestBody = req.body ?? {};
    const projectName = sanitiseProjectName(
      requestBody.projectName || DEFAULT_PROJECT_NAME,
    );
    const sceneName = sanitiseSceneName(
      requestBody.sceneName || DEFAULT_SCENE_NAME,
    );
    const description = sanitiseDescription(requestBody.description);

    const outDir = path.join(process.cwd(), "downloads");
    await mkdir(outDir, { recursive: true });
    const zipName = `${projectName.toLowerCase()}-${Date.now()}.zip`;
    const zipPath = path.join(outDir, zipName);

    await createUnityTemplateZip({
      zipPath,
      projectName,
      sceneName,
      description,
    });

    res.json({
      ok: true,
      path: zipPath,
      projectName,
      sceneName,
    });
  } catch (error) {
    console.error("Failed to generate Unity export", error);
    res.status(500).json({ ok: false, error: String(error) });
  }
}

app.post("/export", async (req, res) => {
  const { projectName = "BlackRoadPrototype", sceneName = "SampleScene" } = req.body ?? {};
  const safeProjectName = sanitizeName(projectName, "BlackRoadPrototype");
  const safeSceneName = sanitizeName(sceneName, "SampleScene");

  try {
    const zipPath = await createZipFromTemplate({
      projectName: safeProjectName,
      sceneName: safeSceneName,
    });

    res.json({
      ok: true,
      path: zipPath,
      projectName,
      sceneName,
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
import {
  cp,
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "fs/promises";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_DIR = path.join(__dirname, "template");
const DEFAULT_PROJECT_NAME = "BlackRoadUnityProject";
const DEFAULT_SCENE_NAME = "MainScene";
const TEXT_EXTENSIONS = new Set([
  ".asset",
  ".cs",
  ".json",
  ".md",
  ".meta",
  ".txt",
  ".unity",
]);

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/export", async (req, res) => {
  const projectName = sanitizeName(req.body?.projectName, DEFAULT_PROJECT_NAME);
  const sceneName = sanitizeName(req.body?.sceneName, DEFAULT_SCENE_NAME);
  const replacements = {
    "__PROJECT_NAME__": projectName,
    "__SCENE_NAME__": sceneName,
  };

  let tmpRoot;
  try {
    await ensureTemplate();

    tmpRoot = await mkdtemp(path.join(os.tmpdir(), "unity-export-"));
    const projectDir = path.join(tmpRoot, projectName);
    await mkdir(projectDir, { recursive: true });
    await cp(TEMPLATE_DIR, projectDir, { recursive: true });

    await replaceTokens(projectDir, replacements);
    await renamePlaceholders(projectDir, replacements);

    const downloadsDir = path.join(process.cwd(), "downloads");
    await mkdir(downloadsDir, { recursive: true });
    const archiveName = `${slugify(projectName)}.zip`;
    const zipPath = path.join(downloadsDir, archiveName);
    await rm(zipPath, { force: true });

    await execFileAsync("zip", ["-r", zipPath, projectName], { cwd: tmpRoot });
app.use(express.json({ limit: "1mb" }));

const DEFAULT_SCENES = ["SampleScene"];

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .replace(/--+/g, "-")
    || "unity-project";
}

function sanitizeScenes(value) {
  if (!Array.isArray(value)) {
    return [...DEFAULT_SCENES];
  }
  const cleaned = value
    .map((scene) => (typeof scene === "string" ? scene.trim() : ""))
    .filter(Boolean);
  if (cleaned.length === 0) {
    return [...DEFAULT_SCENES];
  }
  return Array.from(new Set(cleaned));
}

function buildSceneContent(sceneName, projectName) {
  const lines = [
    `// Auto-generated scene stub for ${projectName}`,
    "%YAML 1.1",
    "%TAG !u! tag:unity3d.com,2011:",
    "--- !u!1 &1000",
    "GameObject:",
    "  m_ObjectHideFlags: 0",
    "  serializedVersion: 6",
    "  m_Component:",
    "  - component: {fileID: 400000}",
    "  m_Layer: 0",
    `  m_Name: ${sceneName}`,
    "  m_TagString: Untagged",
    "  m_Icon: {fileID: 0}",
    "  m_NavMeshLayer: 0",
    "  m_StaticEditorFlags: 0",
    "  m_IsActive: 1",
    "--- !u!4 &400000",
    "Transform:",
    "  m_ObjectHideFlags: 0",
    "  serializedVersion: 10",
    "  m_GameObject: {fileID: 1000}",
    "  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}",
    "  m_LocalPosition: {x: 0, y: 0, z: 0}",
    "  m_LocalScale: {x: 1, y: 1, z: 1}",
    "  m_Children: []",
    "  m_Father: {fileID: 0}",
    "  m_RootOrder: 0",
    "  m_LocalEulerAnglesHint: {x: 0, y: 0, z: 0}",
  ];

  return `${lines.join("\n")}\n`;
}

function buildProjectSettings(projectName) {
  const lines = [
    "%YAML 1.1",
    "%TAG !u! tag:unity3d.com,2011:",
    "--- !u!129 &1",
    "PlayerSettings:",
    "  m_ObjectHideFlags: 0",
    "  serializedVersion: 23",
    `  productName: ${projectName}`,
    "  companyName: BlackRoad",
    "  defaultScreenWidth: 1920",
    "  defaultScreenHeight: 1080",
    "  runInBackground: 1",
    "  visibleInBackground: 1",
    "  allowFullscreenSwitch: 1",
    "  fullscreenMode: 1",
    "  bundleVersion: 0.1.0",
  ];

  return `${lines.join("\n")}\n`;
}

function buildEditorBuildSettings(scenes) {
  const sceneEntries = scenes.map((scene, index) => [
    "  - enabled: 1",
    `    path: Assets/Scenes/${scene}.unity`,
    `    guid: 0000000000000000000000000000000${index}`,
    "    addressable: 0",
    `    order: ${index}`,
  ]);

  const fallback = [
    "  - enabled: 1",
    "    path: Assets/Scenes/SampleScene.unity",
    "    guid: 00000000000000000000000000000000",
    "    addressable: 0",
    "    order: 0",
  ];

  const lines = [
    "%YAML 1.1",
    "%TAG !u! tag:unity3d.com,2011:",
    "--- !u!1045 &1",
    "EditorBuildSettings:",
    "  m_ObjectHideFlags: 0",
    "  serializedVersion: 2",
    "  m_Scenes:",
    ...((sceneEntries.length ? sceneEntries : [fallback]).flat()),
    "  m_configObjects: {}",
  ];

  return `${lines.join("\n")}\n`;
}

function buildReadme(projectName, description, scenes) {
  const content = [
    `# ${projectName}`,
    "",
    description || "This archive contains a starter Unity project generated by the BlackRoad Unity exporter.",
    "",
    "## Scenes",
    ...scenes.map((scene) => `- Assets/Scenes/${scene}.unity`),
    "",
    "## Next Steps",
    "1. Open the project in Unity 2022.3 LTS or newer.",
    "2. Replace the placeholder scenes with your gameplay content.",
    "3. Configure build targets (File → Build Settings) and player options.",
    "4. Wire additional systems (input, lighting, audio) as needed.",
    "",
    "Generated by BlackRoad's Unity exporter service."
  ];

  return content.join("\n");
}

async function prepareUnityProject(projectRoot, projectName, scenes, description) {
  const assetsDir = path.join(projectRoot, "Assets");
  const scenesDir = path.join(assetsDir, "Scenes");
  const packagesDir = path.join(projectRoot, "Packages");
  const settingsDir = path.join(projectRoot, "ProjectSettings");

  await Promise.all([
    mkdir(scenesDir, { recursive: true }),
    mkdir(packagesDir, { recursive: true }),
    mkdir(settingsDir, { recursive: true }),
  ]);

  await Promise.all(
    scenes.map((scene) =>
      writeFile(path.join(scenesDir, `${scene}.unity`), buildSceneContent(scene, projectName))
    )
  );

  const manifest = {
    dependencies: {
      "com.unity.collab-proxy": "2.0.3",
      "com.unity.ide.rider": "3.0.24",
      "com.unity.ide.visualstudio": "2.0.22",
      "com.unity.test-framework": "1.1.33",
      "com.unity.textmeshpro": "3.0.6",
      "com.unity.timeline": "1.7.6",
    },
    registries: [],
  };

  await Promise.all([
    writeFile(path.join(projectRoot, "README.md"), buildReadme(projectName, description, scenes)),
    writeFile(path.join(settingsDir, "ProjectVersion.txt"), "m_EditorVersion: 2022.3.0f1\n"),
    writeFile(path.join(settingsDir, "ProjectSettings.asset"), buildProjectSettings(projectName)),
    writeFile(path.join(settingsDir, "EditorBuildSettings.asset"), buildEditorBuildSettings(scenes)),
    writeFile(path.join(packagesDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`),
  ]);
}

async function createZipFromDirectory(sourceDir, zipPath) {
  await new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

app.post("/export", async (req, res) => {
  const payload = req.body ?? {};
  const rawName = typeof payload.projectName === "string" && payload.projectName.trim().length > 0
    ? payload.projectName.trim()
    : "BlackRoad Unity Project";
  const description = typeof payload.description === "string" ? payload.description.trim() : "";
  const scenes = sanitizeScenes(payload.scenes);

  const projectName = rawName;
  const slug = slugify(projectName);
  const identifier = crypto.randomUUID().slice(0, 8);
  const fileName = `${slug}-${identifier}.zip`;
  const downloadsDir = path.join(process.cwd(), "downloads");

  let stagingRoot;

  try {
    stagingRoot = await mkdtemp(path.join(os.tmpdir(), "unity-export-"));
    const projectRoot = path.join(stagingRoot, slug);
    await prepareUnityProject(projectRoot, projectName, scenes, description);

    await mkdir(downloadsDir, { recursive: true });
    const zipPath = path.join(downloadsDir, fileName);
    await createZipFromDirectory(projectRoot, zipPath);

    res.json({
      ok: true,
      path: zipPath,
      projectName,
      sceneName,
      archiveName,
    });
  } catch (error) {
    console.error("Unity export failed", error);
    res.status(500).json({ ok: false, error: String(error) });
  } finally {
    if (tmpRoot) {
      await rm(tmpRoot, { recursive: true, force: true }).catch(() => undefined);
    }
    const zipPath = path.join(outDir, `${config.projectSlug}.zip`);
    const { filesWritten, generatedAt } = await writeUnityProjectArchive(zipPath, config);
import { cp, mkdtemp, mkdir, readdir, readFile, rename, rm, writeFile } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json({ limit: "1mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_DIR = path.join(__dirname, "template");

const DEFAULTS = {
  projectName: "BlackRoad Sample",
  sceneName: "Sample Scene",
  author: "BlackRoad Systems",
  description: "Generated via the BlackRoad Unity exporter."
};

app.post("/export", async (req, res) => {
  const body = req.body ?? {};
  const projectName = extractString(body.projectName, DEFAULTS.projectName);
  const sceneName = extractString(body.sceneName, DEFAULTS.sceneName);
  const author = extractString(body.author, DEFAULTS.author);
  const description = extractString(body.description, DEFAULTS.description);
  const projectSlug = slugify(projectName) || "blackroad-sample";
  const sceneFile = sceneFileName(sceneName);
  const sceneGuid = normalizeGuid(body.sceneGuid) ?? makeGuid();
  const scriptGuid = normalizeGuid(body.scriptGuid) ?? makeGuid();

  const downloadsDir = path.join(process.cwd(), "downloads");
  const tmpRoot = await mkdtemp(path.join(tmpdir(), "unity-exporter-"));
  const projectRoot = path.join(tmpRoot, projectSlug);

  try {
    await cp(TEMPLATE_DIR, projectRoot, { recursive: true });

    if (sceneFile !== "SampleScene") {
      await rename(
        path.join(projectRoot, "Assets", "Scenes", "SampleScene.unity"),
        path.join(projectRoot, "Assets", "Scenes", `${sceneFile}.unity`)
      );
      await rename(
        path.join(projectRoot, "Assets", "Scenes", "SampleScene.unity.meta"),
        path.join(projectRoot, "Assets", "Scenes", `${sceneFile}.unity.meta`)
      );
    }

    const replacements = {
      __PROJECT_NAME__: projectName,
      __SCENE_NAME__: sceneName,
      __SCENE_FILE__: sceneFile,
      __AUTHOR__: author,
      __DESCRIPTION__: description,
      __SCENE_GUID__: sceneGuid,
      __SCRIPT_GUID__: scriptGuid
    };

    await replacePlaceholders(projectRoot, replacements);

    await mkdir(downloadsDir, { recursive: true });
    const zipPath = path.join(downloadsDir, `${projectSlug}.zip`);
    await rm(zipPath, { force: true });
    await zipDirectory(tmpRoot, projectSlug, zipPath);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateDir = path.join(__dirname, "template");
const scriptTemplatePath = path.join(
  templateDir,
  "Assets",
  "Scripts",
  "BlackRoadBootstrap.cs.tmpl",
);

const DEFAULT_PROJECT_NAME = "BlackRoadUnityProject";

function sanitizeProjectName(rawName) {
  if (!rawName || typeof rawName !== "string") {
    return DEFAULT_PROJECT_NAME;
  }

  const cleaned = rawName
    .replace(/[^a-z0-9 _-]/gi, "")
    .trim()
    .replace(/\s+/g, "-");

  return cleaned.length ? cleaned.slice(0, 60) : DEFAULT_PROJECT_NAME;
}

function escapeForCSharpString(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/"/g, '\\"');
}

function buildProjectOverview({ projectName, description }) {
  const lines = [
    `# ${projectName}`,
    "",
    "Welcome to your freshly generated Unity project scaffold. This bundle",
    "includes a starter script that prints a greeting when the scene loads and",
    "a package manifest pre-wired with common Unity editor integrations.",
    "",
    "## Next steps",
    "",
    "1. Open the project in the Unity Hub or directly via the editor.",
    "2. Create a new scene in `Assets/Scenes` and attach the",
    "   `BlackRoadBootstrap` component to an object.",
    "3. Replace the greeting in `Assets/Scripts/BlackRoadBootstrap.cs` with",
    "   your own onboarding or prototype logic.",
    "",
  ];

  if (description?.trim()) {
    lines.push("## Project pitch", "", description.trim(), "");
  }

  lines.push(
    "## Generated metadata",
    "",
    `- Exported at: ${new Date().toISOString()}`,
    "- Generated by: BlackRoad Unity Exporter",
    "",
  );

  return `${lines.join("\n")}\n`;
}

app.post("/export", async (req, res) => {
  const { projectName, description, welcomeMessage } = req.body ?? {};
  const safeProjectName = sanitizeProjectName(projectName);
  const downloadDir = path.join(process.cwd(), "downloads");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const zipFileName = `${safeProjectName}-${timestamp}.zip`;
  const zipPath = path.join(downloadDir, zipFileName);

  try {
    await mkdir(downloadDir, { recursive: true });

    const output = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    const archiveCompletion = new Promise((resolve, reject) => {
      output.on("close", resolve);
      output.on("error", reject);
      archive.on("error", reject);
    });

    archive.pipe(output);

    archive.glob("**/*", {
      cwd: templateDir,
      dot: true,
      ignore: ["**/*.tmpl"],
    }, {
      prefix: safeProjectName,
    });

    const scriptTemplate = await readFile(scriptTemplatePath, "utf8");
    const finalWelcomeMessage =
      typeof welcomeMessage === "string" && welcomeMessage.trim().length
        ? welcomeMessage.trim()
        : `Welcome to ${safeProjectName}! Let's build something amazing.`;
    const scriptContent = scriptTemplate
      .replace(/__PROJECT_NAME__/g, safeProjectName)
      .replace(
        "Let's build something amazing.",
        escapeForCSharpString(finalWelcomeMessage),
      );

    archive.append(scriptContent, {
      name: path.posix.join(
        safeProjectName,
        "Assets",
        "Scripts",
        "BlackRoadBootstrap.cs",
      ),
    });

    const overview = buildProjectOverview({
      projectName: safeProjectName,
      description,
    });

    archive.append(overview, {
      name: path.posix.join(safeProjectName, "PROJECT_OVERVIEW.md"),
    });

    archive.append(
      JSON.stringify(
        {
          projectName: safeProjectName,
          description: description ?? null,
          welcomeMessage: finalWelcomeMessage,
          generatedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
      {
        name: path.posix.join(safeProjectName, "BlackRoadConfig.json"),
      },
    );

    await archive.finalize();
    await archiveCompletion;
import console from 'node:console';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import express from 'express';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';
import { finished } from 'stream/promises';
import yazl from 'yazl';

import {
  buildUnityTemplate,
  sanitizeName,
  UNITY_VERSION,
  DEFAULT_PROJECT_NAME,
  DEFAULT_SCENE_NAME,
} from './template.js';

const { ZipFile } = yazl;

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/healthz', (_req, res) => {
  res.json({
    ok: true,
    service: 'unity-exporter',
    unityVersion: UNITY_VERSION,
  });
});

app.post('/export', async (req, res) => {
  try {
    const projectName = sanitizeName(
      req.body?.projectName,
      DEFAULT_PROJECT_NAME
    );
    const sceneName = sanitizeName(req.body?.sceneName, DEFAULT_SCENE_NAME);

    const outDir = path.join(process.cwd(), 'downloads');
    await mkdir(outDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const zipFileName = `${projectName}-${timestamp}.zip`;
    const zipPath = path.join(outDir, zipFileName);

    const template = buildUnityTemplate({ projectName, sceneName });

    const zipFile = new ZipFile();
    const fileList = [];
    for (const [filePath, contents] of template.files.entries()) {
      zipFile.addBuffer(Buffer.from(contents, 'utf8'), filePath);
      fileList.push(filePath);
    }

    const outStream = createWriteStream(zipPath);
    zipFile.outputStream.on('error', (err) => outStream.destroy(err));
    zipFile.outputStream.pipe(outStream);
    zipFile.end();
    await finished(outStream);

    res.json({
      ok: true,
      path: zipPath,
      project: {
        name: config.projectName,
        slug: config.projectSlug,
        scene: config.sceneName,
        unityVersion: UNITY_VERSION,
        generatedAt,
        files: filesWritten
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
      fileName: zipFileName,
      projectName,
      sceneName,
      scriptName,
    const projectName = sanitizeProjectName(_req.body?.projectName);
    const description = _req.body?.description;
    const outDir = path.join(process.cwd(), "downloads");
    const zipPath = path.join(outDir, `${projectName}.zip`);
    const files = TEMPLATE_FILES(projectName, description);
    await writeTemplateZip(zipPath, files);
    res.json({
      ok: true,
      path: zipPath,
      projectName,
      files: files.map((file) => file.path)
        name: projectName,
        scene: `${sceneName}.unity`,
        unityVersion: UNITY_VERSION,
        files: fileList,
      },
      instructions: template.instructions,
    });
  } catch (e) {
    console.error("Failed to export Unity project", e);
    res.status(500).json({ ok: false, error: String(e) });
        name: projectName,
        slug: projectSlug,
        scene: {
          name: sceneName,
          file: `Assets/Scenes/${sceneFile}.unity`,
          guid: sceneGuid
        },
        scriptGuid,
        author,
        description
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  } finally {
    await rm(tmpRoot, { recursive: true, force: true });
      fileName,
      projectName,
      scenes,
      description,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ ok: false, error: message });
  } finally {
    if (stagingRoot) {
      await rm(stagingRoot, { recursive: true, force: true });
    }
      projectName: safeProjectName,
      bytes: archive.pointer(),
    });
  } catch (error) {
    console.error("Unity exporter failed", error);
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
import { execFile } from "child_process";
import { mkdir, rm, stat, writeFile } from "fs/promises";
import archiver from "archiver";
import { randomUUID } from "crypto";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const DEFAULT_PROJECT_NAME = "BlackRoadUnityProject";
const DEFAULT_SCENES = ["SampleScene"];
const SCRIPT_FILE = "HelloBlackRoad.cs";

const app = express();
app.use(express.json({ limit: "1mb" }));

const DEFAULT_DEPENDENCIES = {
  "com.unity.ide.rider": "3.0.29",
  "com.unity.ide.visualstudio": "2.0.22",
  "com.unity.ide.vscode": "1.2.5",
  "com.unity.render-pipelines.universal": "14.0.11",
  "com.unity.test-framework": "1.1.33",
  "com.unity.textmeshpro": "3.0.6",
  "com.unity.timeline": "1.7.5",
};

const DEFAULT_SCENES = [
  {
    name: "SampleScene",
    description: "Starter sandbox scene",
  },
];

app.post("/export", async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res
      .status(400)
      .json({ ok: false, error: "Request body must be a JSON object." });
  }

  let workspaceDir;
  try {
    const {
      projectName = "UnityPrototype",
      unityVersion = "2022.3.40f1",
      companyName = "BlackRoad",
      productName,
      scenes,
      packages,
    } = req.body;

    const safeProjectName = sanitiseIdentifier(projectName) || "UnityPrototype";
    const unityVersionString = String(unityVersion).trim() || "2022.3.40f1";
    const company = normaliseText(companyName, "BlackRoad");
    const product = normaliseText(productName, safeProjectName);

    const normalisedScenes = buildScenes(scenes);
    const { dependencies, requestedPackages } = buildDependencies(packages);

    const downloadsDir = resolveDownloadsDir();
    await mkdir(downloadsDir, { recursive: true });

    const workspaceName = `${safeProjectName}-${Date.now().toString(36)}`;
    workspaceDir = path.join(downloadsDir, workspaceName);

    await Promise.all([
      mkdir(workspaceDir, { recursive: true }),
      mkdir(path.join(workspaceDir, "Assets", "Scenes"), { recursive: true }),
      mkdir(path.join(workspaceDir, "Packages"), { recursive: true }),
      mkdir(path.join(workspaceDir, "ProjectSettings"), { recursive: true }),
    ]);

    const sceneEntries = await writeScenes(workspaceDir, normalisedScenes);

    await Promise.all([
      writeFile(
        path.join(workspaceDir, "Packages", "manifest.json"),
        createManifest(dependencies),
        "utf8",
      ),
      writeFile(
        path.join(workspaceDir, "ProjectSettings", "ProjectVersion.txt"),
        createProjectVersion(unityVersionString),
        "utf8",
      ),
      writeFile(
        path.join(workspaceDir, "ProjectSettings", "EditorBuildSettings.asset"),
        createEditorBuildSettings(sceneEntries),
        "utf8",
      ),
      writeFile(
        path.join(workspaceDir, "ProjectSettings", "ProjectSettings.asset"),
        createProjectSettings({ company, product }),
        "utf8",
      ),
      writeFile(
        path.join(workspaceDir, "README.md"),
        createReadme({
          projectName: safeProjectName,
          companyName: company,
          productName: product,
          unityVersion: unityVersionString,
          scenes: normalisedScenes,
          packages: dependencies,
        }),
        "utf8",
      ),
    ]);

    const zipName = `${workspaceName}.zip`;
    const zipPath = path.join(downloadsDir, zipName);

    await execFileAsync("zip", ["-qr", zipPath, "."], {
      cwd: workspaceDir,
    });

    const zipStat = await stat(zipPath);

    await rm(workspaceDir, { recursive: true, force: true });

    res.json({
      ok: true,
      project: {
        name: safeProjectName,
        unityVersion: unityVersionString,
        companyName: company,
        productName: product,
      },
      scenes: sceneEntries,
      packages: dependencies,
      requestedPackages,
      archive: {
        path: path.relative(process.cwd(), zipPath),
        sizeBytes: zipStat.size,
      },
      notes:
        "Import the archive into Unity Hub or unzip into your Unity projects folder.",
    });
  } catch (error) {
    if (workspaceDir) {
      await rm(workspaceDir, { recursive: true, force: true }).catch(() => {});
    }
    res.status(500).json({ ok: false, error: error.message || String(error) });
  try {
    const { projectName, description } = req.body ?? {};
    const result = await createUnityProject({ projectName, description });
    res.json({ ok: true, ...result });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
      details: error.cause ? String(error.cause) : undefined,
    });
import { createUnityProjectArchive } from "./template.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.post("/export", async (req, res) => {
  try {
    const { buffer, zipName, fileManifest, metadata } = await createUnityProjectArchive({
      projectName: req.body?.projectName,
      sceneName: req.body?.sceneName,
      summary: req.body?.summary,
      features: Array.isArray(req.body?.features) ? req.body.features : undefined,
    });

    const outDir = path.join(process.cwd(), "downloads");
    await mkdir(outDir, { recursive: true });
    const zipPath = path.join(outDir, zipName);
    await writeFile(zipPath, buffer);
app.post("/export", async (req, res) => {
  try {
    const { projectName, description, scenes } = req.body ?? {};
    const normalizedProjectName = normalizeProjectName(projectName);
    const projectScenes = normalizeScenes(scenes);

    const outDir = path.join(process.cwd(), "downloads");
    await mkdir(outDir, { recursive: true });

    const archiveName = `${toArchiveSlug(normalizedProjectName)}-${timestampSlug()}.zip`;
    const zipPath = path.join(outDir, archiveName);

    await createUnityArchive({
      projectName: normalizedProjectName,
      description: typeof description === "string" ? description : "",
      scenes: projectScenes,
      destination: zipPath,
    });

    res.json({
      ok: true,
      path: zipPath,
      fileName: zipName,
      files: fileManifest,
      metadata,
    });
  } catch (error) {
    console.error("unity exporter failed", error);
    res.status(400).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
      project: safeProjectName,
      scene: safeSceneName,
      path: zipPath,
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message || String(error) });
      archive: archiveName,
      projectName: normalizedProjectName,
      scenes: projectScenes.map((scene) => scene.displayName),
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("unity exporter listening on", port));

function sanitizeProjectName(name) {
  if (typeof name !== "string") {
    return "BlackRoadUnityProject";
  }
  const cleaned = name
    .trim()
    .replace(/[^A-Za-z0-9 _-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
  return cleaned ? cleaned.slice(0, 64) : "BlackRoadUnityProject";
}

function normalizeScenes(input) {
  if (input === undefined) {
    return ["MainScene"];
  }
  if (!Array.isArray(input)) {
    throw new ExportError("`scenes` must be an array of names", 400);
  }
  const sanitized = input
    .map((scene) => (typeof scene === "string" ? scene : ""))
    .map((scene) =>
      scene
        .trim()
        .replace(/[^A-Za-z0-9 _-]/g, "")
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^[_-]+|[_-]+$/g, "")
    )
    .filter(Boolean);
  const uniqueScenes = Array.from(new Set(sanitized)).slice(0, 20);
  return uniqueScenes.length > 0 ? uniqueScenes : ["MainScene"];
}

async function createUnityProject({ projectName, scenes, description }) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "unity-export-"));
  const projectRoot = path.join(tempRoot, projectName);
  const scenesDir = path.join(projectRoot, "Assets", "Scenes");
  const projectSettingsDir = path.join(projectRoot, "ProjectSettings");
  const packagesDir = path.join(projectRoot, "Packages");

  try {
    await mkdir(scenesDir, { recursive: true });
    await mkdir(projectSettingsDir, { recursive: true });
    await mkdir(packagesDir, { recursive: true });

    await Promise.all([
      writeReadme(projectRoot, projectName, description),
      writeBuildSettings(projectSettingsDir, scenes),
      writeProjectVersion(projectSettingsDir),
      writeProjectSettings(projectSettingsDir),
      writeManifest(packagesDir)
    ]);

    await Promise.all(
      scenes.map((sceneName, index) =>
        writeScene(path.join(scenesDir, `${sceneName}.unity`), sceneName, index)
      )
    );

    const downloadsDir = path.join(process.cwd(), "downloads");
    await mkdir(downloadsDir, { recursive: true });
    const zipPath = path.join(
      downloadsDir,
      `${projectName}-${Date.now()}.zip`
    );

    try {
      await execFileAsync("zip", ["-rq", zipPath, projectName], {
        cwd: tempRoot
      });
    } catch (error) {
      throw new ExportError(
        "Failed to bundle Unity project. Ensure the `zip` utility is available.",
        500
      );
    }

    const fileStats = await stat(zipPath);
    return {
      path: zipPath,
      projectName,
      scenes,
      size: fileStats.size,
      createdAt: new Date().toISOString()
    };
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

async function writeReadme(projectRoot, projectName, description) {
  const contents = [`# ${projectName}`, "", description?.trim() || "Unity project scaffold generated by BlackRoad.", "", "## Getting Started", "1. Open the project in Unity 2022.3 LTS or newer.", "2. Review the generated scenes under `Assets/Scenes`.", "3. Update project settings and packages to match your team's standards."].join("\n");
  await writeFile(path.join(projectRoot, "README.md"), contents, "utf8");
}

async function writeBuildSettings(projectSettingsDir, scenes) {
  const entries = scenes
    .map(
      (scene) =>
        "  - enabled: 1\n" +
        `    path: Assets/Scenes/${scene}.unity\n` +
        "    guid: 00000000000000000000000000000000"
    )
    .join("\n");
  const contents =
    "%YAML 1.1\n" +
    "%TAG !u! tag:unity3d.com,2011:\n" +
    "--- !u!1045 &1\n" +
    "EditorBuildSettings:\n" +
    "  m_ObjectHideFlags: 0\n" +
    "  serializedVersion: 2\n" +
    "  m_Scenes:\n" +
    entries +
    "\n  m_configObjects: {}\n";
  await writeFile(
    path.join(projectSettingsDir, "EditorBuildSettings.asset"),
    contents,
    "utf8"
  );
}

async function writeProjectVersion(projectSettingsDir) {
  const contents = [
    "m_EditorVersion: 2022.3.21f1",
    "m_EditorVersionWithRevision: 2022.3.21f1 (revision 6c5b472a2d91)"
  ].join("\n");
  await writeFile(
    path.join(projectSettingsDir, "ProjectVersion.txt"),
    contents,
    "utf8"
  );
}

async function writeProjectSettings(projectSettingsDir) {
  const contents =
    "%YAML 1.1\n" +
    "%TAG !u! tag:unity3d.com,2011:\n" +
    "--- !u!129 &1\n" +
    "PlayerSettings:\n" +
    "  m_ObjectHideFlags: 0\n" +
    "  serializedVersion: 23\n" +
    "  productName: BlackRoad Prototype\n" +
    "  companyName: BlackRoad Labs\n" +
    "  defaultScreenWidth: 1920\n" +
    "  defaultScreenHeight: 1080\n" +
    "  fullscreenMode: 1\n" +
    "  defaultScreenOrientation: 4\n" +
    "  displayResolutionDialog: 1\n" +
    "  targetDevice: 2\n" +
    "  usePlayerLog: 1\n" +
    "  forceSingleInstance: 0\n" +
    "  resizableWindow: 1\n" +
    "  useMacAppStoreValidation: 0\n" +
    "  protectGraphicsMemory: 0\n" +
    "  visibleInBackground: 1\n" +
    "  allowFullscreenSwitch: 1\n" +
    "  runInBackground: 1\n" +
    "  captureSingleScreen: 0\n";
  await writeFile(
    path.join(projectSettingsDir, "ProjectSettings.asset"),
    contents,
    "utf8"
  );
}

async function writeManifest(packagesDir) {
  const manifest = {
    dependencies: {
      "com.unity.collab-proxy": "1.17.7",
      "com.unity.ide.rider": "3.0.24",
      "com.unity.ide.visualstudio": "2.0.22",
      "com.unity.ide.vscode": "1.2.5",
      "com.unity.render-pipelines.universal": "14.0.10",
      "com.unity.test-framework": "1.3.9",
      "com.unity.textmeshpro": "3.0.6",
      "com.unity.timeline": "1.7.5",
      "com.unity.ugui": "1.0.0",
      "com.unity.modules.ai": "1.0.0",
      "com.unity.modules.animation": "1.0.0",
      "com.unity.modules.audio": "1.0.0",
      "com.unity.modules.director": "1.0.0",
      "com.unity.modules.imageconversion": "1.0.0",
      "com.unity.modules.jsonserialize": "1.0.0",
      "com.unity.modules.particlesystem": "1.0.0",
      "com.unity.modules.physics": "1.0.0",
      "com.unity.modules.physics2d": "1.0.0",
      "com.unity.modules.tilemap": "1.0.0",
      "com.unity.modules.ui": "1.0.0",
      "com.unity.modules.uielements": "1.0.0",
      "com.unity.modules.unitywebrequest": "1.0.0",
      "com.unity.modules.video": "1.0.0"
    }
  };
  await writeFile(
    path.join(packagesDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );
}

async function writeScene(scenePath, sceneName, index) {
  const contents =
    "%YAML 1.1\n" +
    "%TAG !u! tag:unity3d.com,2011:\n" +
    "--- !u!29 &1\n" +
    "SceneSettings:\n" +
    "  m_ObjectHideFlags: 0\n" +
    "--- !u!104 &2\n" +
    "RenderSettings:\n" +
    "  m_ObjectHideFlags: 0\n" +
    "--- !u!157 &3\n" +
    "LightmapSettings:\n" +
    "  m_ObjectHideFlags: 0\n" +
    "--- !u!196 &4\n" +
    "NavMeshSettings:\n" +
    "  m_ObjectHideFlags: 0\n" +
    "--- !u!1 &1000\n" +
    "GameObject:\n" +
    `  m_Name: ${sceneName}\n` +
    "  m_Component:\n" +
    "  - component: {fileID: 2000}\n" +
    "  m_Layer: 0\n" +
    "  m_IsActive: 1\n" +
    "--- !u!4 &2000\n" +
    "Transform:\n" +
    "  m_GameObject: {fileID: 1000}\n" +
    "  m_LocalPosition: {x: 0, y: 0, z: 0}\n" +
    "  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}\n" +
    "  m_LocalScale: {x: 1, y: 1, z: 1}\n" +
    `  m_RootOrder: ${index}\n` +
    "  m_LocalEulerAnglesHint: {x: 0, y: 0, z: 0}\n";
  await writeFile(scenePath, contents, "utf8");
}
app.listen(port, () => {
  console.log("unity exporter listening on", port);
});

export default app;
function sanitizeName(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  const cleaned = trimmed
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || fallback;
}

async function createUnityProjectZip({
  projectName,
  sceneName,
  description,
  zipPath,
}) {
  await new Promise((resolve, reject) => {
    const zip = new ZipFile();
    const output = createWriteStream(zipPath);
    zip.outputStream
      .pipe(output)
      .on("close", resolve)
      .on("error", reject);

    const root = `${projectName}/`;
    const sceneFolder = `${root}Assets/Scenes/`;
    const scriptsFolder = `${root}Assets/Scripts/`;
    const projectSettingsFolder = `${root}ProjectSettings/`;
    const packagesFolder = `${root}Packages/`;

    zip.addEmptyDirectory(root);
    zip.addEmptyDirectory(sceneFolder);
    zip.addEmptyDirectory(scriptsFolder);
    zip.addEmptyDirectory(projectSettingsFolder);
    zip.addEmptyDirectory(packagesFolder);

    addTextFile(
      zip,
      `${root}README.md`,
      buildReadme(projectName, sceneName, description),
    );

    addTextFile(zip, `${scriptsFolder}BlackRoadBootstrap.cs`, buildBootstrapScript(description));

    addTextFile(
      zip,
      `${sceneFolder}${sceneName}.unity`,
      buildSampleScene(sceneName),
    );

    addTextFile(
      zip,
      `${projectSettingsFolder}ProjectVersion.txt`,
      `m_EditorVersion: ${DEFAULT_EDITOR_VERSION}\n` +
        `m_EditorVersionWithRevision: ${DEFAULT_EDITOR_VERSION} (000000000000)\n`,
    );

    addTextFile(
      zip,
      `${projectSettingsFolder}EditorBuildSettings.asset`,
      buildEditorBuildSettings(sceneName),
    );

    addTextFile(
      zip,
      `${packagesFolder}manifest.json`,
      buildManifest(),
    );

    addTextFile(
      zip,
      `${packagesFolder}packages-lock.json`,
      buildPackagesLock(),
    );

    zip.end();
  });
}

function addTextFile(zip, filePath, contents) {
  zip.addBuffer(Buffer.from(contents, "utf8"), filePath);
}

function buildReadme(projectName, sceneName, description) {
  const desc = description?.trim();
  const sections = [
    `# ${projectName}`,
    "",
    "This archive was generated by the BlackRoad Unity exporter worker.",
    "",
    `- **Default scene:** \`Assets/Scenes/${sceneName}.unity\``,
    "- **Bootstrap script:** `Assets/Scripts/BlackRoadBootstrap.cs`",
  ];

  if (desc) {
    sections.push("", "## Scenario", "", desc);
  }

  sections.push(
    "",
    "## Getting Started",
    "",
    "1. Open the project folder in Unity (2022.3 or newer recommended).",
    `2. Open the \`${sceneName}.unity\` scene from the \`Assets/Scenes\` folder.`,
    "3. Enter Play Mode to see the bootstrap behaviour logging to the Console.",
    "",
    "You can now extend the project with additional assets, scripts, and scenes.",
  );

  return sections.join("\n");
}

function buildBootstrapScript(description) {
  const message = (description?.trim() || "Welcome to the BlackRoad prototype scene.").replace(/\r?\n\s*/g, " ").trim();
  const literal = JSON.stringify(message);
  return `using UnityEngine;\n\npublic class BlackRoadBootstrap : MonoBehaviour\n{\n    [SerializeField]\n    private string message = ${literal};\n\n    private void Start()\n    {\n        Debug.Log($"[BlackRoadBootstrap] {message}");\n    }\n}\n`;
}

function buildSampleScene(sceneName) {
  return `%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:\n--- !u!29 &1\nSceneAsset:\n  m_ObjectHideFlags: 0\n  m_CorrespondingSourceObject: {fileID: 0}\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n  m_Name: ${sceneName}\n  serializedVersion: 0\n  m_MasterSceneGuid: 00000000000000000000000000000000\n--- !u!104 &2\nRenderSettings:\n  m_ObjectHideFlags: 0\n  serializedVersion: 9\n  m_Fog: 0\n  m_FogColor: {r: 0.5, g: 0.5, b: 0.5, a: 1}\n  m_FogMode: 3\n  m_FogDensity: 0.01\n  m_LinearFogStart: 0\n  m_LinearFogEnd: 300\n  m_AmbientSkyColor: {r: 0.212, g: 0.227, b: 0.259, a: 1}\n  m_AmbientEquatorColor: {r: 0.114, g: 0.125, b: 0.133, a: 1}\n  m_AmbientGroundColor: {r: 0.047, g: 0.043, b: 0.035, a: 1}\n  m_AmbientIntensity: 1\n  m_AmbientMode: 0\n  m_SubtractiveShadowColor: {r: 0.42, g: 0.478, b: 0.627, a: 1}\n  m_SkyboxMaterial: {fileID: 10304, guid: 0000000000000000f000000000000000, type: 0}\n  m_HaloStrength: 0.5\n  m_FlareStrength: 1\n  m_FlareFadeSpeed: 3\n  m_HaloTexture: {fileID: 0}\n  m_SpotCookie: {fileID: 10001, guid: 0000000000000000e000000000000000, type: 0}\n  m_DefaultReflectionMode: 0\n  m_DefaultReflectionResolution: 128\n  m_ReflectionBounces: 1\n  m_ReflectionIntensity: 1\n  m_CustomReflection: {fileID: 0}\n  m_Sun: {fileID: 0}\n  m_IndirectSpecularColor: {r: 0.44657898, g: 0.4964133, b: 0.5748178, a: 1}\n  m_UseRadianceAmbientProbe: 0\n--- !u!157 &3\nLightmapSettings:\n  m_ObjectHideFlags: 0\n  serializedVersion: 12\n  m_GIWorkflowMode: 0\n  m_GISettings:\n    serializedVersion: 2\n    m_BounceScale: 1\n    m_IndirectOutputScale: 1\n    m_AlbedoBoost: 1\n    m_EnvironmentLightingMode: 0\n    m_EnableBakedLightmaps: 1\n    m_EnableRealtimeLightmaps: 0\n  m_LightmapEditorSettings:\n    serializedVersion: 12\n    m_Resolution: 2\n    m_BakeResolution: 40\n    m_AtlasSize: 1024\n    m_AO: 0\n    m_AOMaxDistance: 1\n    m_CompAOExponent: 1\n    m_CompAOExponentDirect: 0\n    m_ExtractAmbientOcclusion: 0\n    m_Padding: 2\n    m_LightmapParameters: {fileID: 0}\n    m_LightmapsBakeMode: 1\n    m_TextureCompression: 1\n    m_FinalGather: 0\n    m_FinalGatherFiltering: 1\n    m_FinalGatherRayCount: 256\n    m_ReflectionCompression: 2\n    m_MixedBakeMode: 2\n    m_BakeBackend: 1\n    m_PVRSampling: 1\n    m_PVRDirectSampleCount: 32\n    m_PVRSampleCount: 500\n    m_PVRBounces: 2\n    m_PVREnvironmentSampleCount: 256\n    m_PVREnvironmentReferencePointCount: 2048\n    m_PVRFilteringMode: 2\n    m_PVRDenoiserTypeDirect: 1\n    m_PVRDenoiserTypeIndirect: 1\n    m_PVRDenoiserTypeAO: 1\n    m_PVRFilterTypeDirect: 0\n    m_PVRFilterTypeIndirect: 0\n    m_PVRFilterTypeAO: 0\n    m_PVREnvironmentMIS: 0\n    m_PVRCulling: 1\n    m_PVRFilteringGaussRadiusDirect: 1\n    m_PVRFilteringGaussRadiusIndirect: 5\n    m_PVRFilteringGaussRadiusAO: 2\n    m_PVRFilteringAtrousPositionSigmaDirect: 0.5\n    m_PVRFilteringAtrousPositionSigmaIndirect: 2\n    m_PVRFilteringAtrousPositionSigmaAO: 1\n    m_ExportTrainingData: 0\n    m_TrainingDataDestination: \"\"\n    m_LightProbeSampleCountMultiplier: 1\n  m_LightingDataAsset: {fileID: 0}\n  m_LightingSettings: {fileID: 0}\n--- !u!196 &4\nNavMeshSettings:\n  serializedVersion: 2\n  m_ObjectHideFlags: 0\n  m_BuildSettings:\n    serializedVersion: 2\n    agentTypeID: 0\n    agentRadius: 0.5\n    agentHeight: 2\n    agentSlope: 45\n    agentClimb: 0.4\n    ledgeDropHeight: 0\n    maxJumpAcrossDistance: 0\n    minRegionArea: 2\n    manualCellSize: 0\n    cellSize: 0.16666667\n    manualTileSize: 0\n    tileSize: 256\n    accuratePlacement: 0\n    maxJobWorkers: 0\n    preserveTilesOutsideBounds: 0\n    debug: 0\n  m_NavMeshData: {fileID: 0}\n--- !u!1 &1000\nGameObject:\n  m_ObjectHideFlags: 0\n  m_CorrespondingSourceObject: {fileID: 0}\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n  serializedVersion: 6\n  m_Component:\n  - component: {fileID: 1001}\n  - component: {fileID: 1002}\n  m_Layer: 0\n  m_Name: Main Camera\n  m_TagString: MainCamera\n  m_Icon: {fileID: 0}\n  m_NavMeshLayer: 0\n  m_StaticEditorFlags: 0\n  m_IsActive: 1\n--- !u!4 &1001\nTransform:\n  m_ObjectHideFlags: 0\n  m_CorrespondingSourceObject: {fileID: 0}\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n  m_GameObject: {fileID: 1000}\n  serializedVersion: 2\n  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}\n  m_LocalPosition: {x: 0, y: 1, z: -10}\n  m_LocalScale: {x: 1, y: 1, z: 1}\n  m_ConstrainProportionsScale: 0\n  m_Children: []\n  m_Father: {fileID: 0}\n  m_RootOrder: 0\n  m_LocalEulerAnglesHint: {x: 0, y: 0, z: 0}\n--- !u!20 &1002\nCamera:\n  m_ObjectHideFlags: 0\n  m_CorrespondingSourceObject: {fileID: 0}\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n  m_GameObject: {fileID: 1000}\n  m_Enabled: 1\n  serializedVersion: 2\n  m_ClearFlags: 1\n  m_BackGroundColor: {r: 0.19215687, g: 0.3019608, b: 0.4745098, a: 0}\n  m_projectionMatrixMode: 1\n  m_GateFitMode: 2\n  m_FOVAxisMode: 0\n  m_SensorSize: {x: 36, y: 24}\n  m_LensShift: {x: 0, y: 0}\n  m_FocalLength: 50\n  m_NormalizedViewPortRect:\n    serializedVersion: 2\n    x: 0\n    y: 0\n    width: 1\n    height: 1\n  near clip plane: 0.3\n  far clip plane: 1000\n  field of view: 60\n  orthographic: 0\n  orthographic size: 5\n  m_Depth: -1\n  m_CullingMask:\n    serializedVersion: 2\n    m_Bits: 4294967295\n  m_RenderingPath: -1\n  m_TargetTexture: {fileID: 0}\n  m_TargetDisplay: 0\n  m_TargetEye: 3\n  m_HDR: 1\n  m_AllowMSAA: 1\n  m_AllowDynamicResolution: 0\n  m_ForceIntoRT: 0\n  m_OcclusionCulling: 1\n  m_StereoConvergence: 10\n  m_StereoSeparation: 0.022\n--- !u!1 &2000\nGameObject:\n  m_ObjectHideFlags: 0\n  m_CorrespondingSourceObject: {fileID: 0}\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n  serializedVersion: 6\n  m_Component:\n  - component: {fileID: 2001}\n  - component: {fileID: 2002}\n  - component: {fileID: 2003}\n  m_Layer: 0\n  m_Name: Directional Light\n  m_TagString: Untagged\n  m_Icon: {fileID: 0}\n  m_NavMeshLayer: 0\n  m_StaticEditorFlags: 0\n  m_IsActive: 1\n--- !u!4 &2001\nTransform:\n  m_ObjectHideFlags: 0\n  m_CorrespondingSourceObject: {fileID: 0}\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n  m_GameObject: {fileID: 2000}\n  serializedVersion: 2\n  m_LocalRotation: {x: 0.40821788, y: -0.23456968, z: 0.10938163, w: 0.8754261}\n  m_LocalPosition: {x: 0, y: 3, z: 0}\n  m_LocalScale: {x: 1, y: 1, z: 1}\n  m_ConstrainProportionsScale: 0\n  m_Children: []\n  m_Father: {fileID: 0}\n  m_RootOrder: 1\n  m_LocalEulerAnglesHint: {x: 50, y: -30, z: 0}\n--- !u!108 &2002\nLight:\n  m_ObjectHideFlags: 0\n  m_CorrespondingSourceObject: {fileID: 0}\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n  m_GameObject: {fileID: 2000}\n  m_Enabled: 1\n  serializedVersion: 10\n  m_Type: 1\n  m_Shape: 0\n  m_Color: {r: 1, g: 0.95686275, b: 0.8392157, a: 1}\n  m_Intensity: 1\n  m_Range: 10\n  m_SpotAngle: 30\n  m_InnerSpotAngle: 21.80208\n  m_CookieSize: 10\n  m_Shadows:\n    m_Type: 2\n    m_Resolution: -1\n    m_CustomResolution: -1\n    m_Strength: 1\n    m_Bias: 0.05\n    m_NormalBias: 0.4\n    m_NearPlane: 0.2\n  m_Cookie: {fileID: 0}\n  m_DrawHalo: 0\n  m_Flare: {fileID: 0}\n  m_RenderMode: 0\n  m_CullingMask:\n    serializedVersion: 2\n    m_Bits: 4294967295\n  m_Lightmapping: 4\n  m_LightShadowCasterMode: 0\n  m_AreaSize: {x: 1, y: 1}\n  m_BounceIntensity: 1\n  m_ColorTemperature: 6570\n  m_UseColorTemperature: 0\n  m_BoundingSphereOverride: {x: 0, y: 0, z: 0, w: 0}\n  m_UseBoundingSphereOverride: 0\n  m_ShadowRadius: 0\n  m_ShadowAngle: 0\n--- !u!114 &2003\nMonoBehaviour:\n  m_ObjectHideFlags: 0\n  m_CorrespondingSourceObject: {fileID: 0}\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n  m_GameObject: {fileID: 2000}\n  m_Enabled: 1\n  m_EditorHideFlags: 0\n  m_Script: {fileID: 11500000, guid: 0000000000000000e000000000000000, type: 0}\n  m_Name: \"\"\n  m_EditorClassIdentifier: \"\"\n  message: Welcome to the BlackRoad prototype scene.\n`;
}

function buildEditorBuildSettings(sceneName) {
  return `%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:\n--- !u!1045 &1\nEditorBuildSettings:\n  m_ObjectHideFlags: 0\n  serializedVersion: 2\n  m_Scenes:\n  - enabled: 1\n    path: Assets/Scenes/${sceneName}.unity\n    guid: 00000000000000000000000000000000\n  m_configObjects: { }\n`;
}

function buildManifest() {
  return `{
  "dependencies": {
    "com.unity.ai.navigation": "1.1.5",
    "com.unity.cinemachine": "2.9.7",
    "com.unity.collab-proxy": "2.0.5",
    "com.unity.inputsystem": "1.7.0",
    "com.unity.test-framework": "1.1.33",
    "com.unity.textmeshpro": "3.0.6",
    "com.unity.timeline": "1.8.6",
    "com.unity.visualscripting": "1.9.5",
    "com.unity.modules.ai": "1.0.0",
    "com.unity.modules.androidjni": "1.0.0",
    "com.unity.modules.animation": "1.0.0",
    "com.unity.modules.assetbundle": "1.0.0",
    "com.unity.modules.audio": "1.0.0",
    "com.unity.modules.cloth": "1.0.0",
    "com.unity.modules.director": "1.0.0",
    "com.unity.modules.imageconversion": "1.0.0",
    "com.unity.modules.imgui": "1.0.0",
    "com.unity.modules.jsonserialize": "1.0.0",
    "com.unity.modules.particlesystem": "1.0.0",
    "com.unity.modules.physics": "1.0.0",
    "com.unity.modules.physics2d": "1.0.0",
    "com.unity.modules.screencapture": "1.0.0",
    "com.unity.modules.terrain": "1.0.0",
    "com.unity.modules.terrainphysics": "1.0.0",
    "com.unity.modules.tilemap": "1.0.0",
    "com.unity.modules.ui": "1.0.0",
    "com.unity.modules.uielements": "1.0.0",
    "com.unity.modules.umbra": "1.0.0",
    "com.unity.modules.unityanalytics": "1.0.0",
    "com.unity.modules.unitywebrequest": "1.0.0",
    "com.unity.modules.unitywebrequestassetbundle": "1.0.0",
    "com.unity.modules.unitywebrequestaudio": "1.0.0",
    "com.unity.modules.unitywebrequesttexture": "1.0.0",
    "com.unity.modules.unitywebrequestwww": "1.0.0",
    "com.unity.modules.vehicles": "1.0.0",
    "com.unity.modules.video": "1.0.0",
    "com.unity.modules.vr": "1.0.0",
    "com.unity.modules.wind": "1.0.0",
    "com.unity.modules.xr": "1.0.0"
  }
}
`;
}

function buildPackagesLock() {
  return `{
  "dependencies": {
    "com.unity.ai.navigation": {
      "version": "1.1.5",
      "depth": 0,
      "source": "registry",
      "dependencies": {
        "com.unity.mathematics": "1.2.6"
      }
    },
    "com.unity.cinemachine": {
      "version": "2.9.7",
      "depth": 0,
      "source": "registry",
      "dependencies": {
        "com.unity.modules.animation": "1.0.0"
      }
    }
  }
}
`;
}
import archiver from "archiver";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json({ limit: "1mb" }));

const DEFAULT_PACKAGES = {
  "com.unity.collab-proxy": "2.0.6",
  "com.unity.inputsystem": "1.7.0",
  "com.unity.textmeshpro": "3.0.6",
};

const DOWNLOADS_ROOT = path.join(process.cwd(), "downloads", "unity");

class ExportError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "ExportError";
    this.status = status;
  }
}

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\-_.\s]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "unity-project";

const normalizeScenes = (input) => {
  const source =
    typeof input === "string"
      ? [input]
      : Array.isArray(input)
      ? input
      : [];
  const candidates = source.length > 0 ? source : ["MainScene"];
  const seen = new Set();

  return candidates
    .map((scene, index) =>
      typeof scene === "string" ? scene.trim() : `Scene${index + 1}`
    )
    .filter(Boolean)
    .map((scene, index) => {
      const sanitized = scene.replace(/[^a-z0-9_\-\s]/gi, "");
      const base = sanitized.replace(/\s+/g, "");
      const fallback = base || `Scene${index + 1}`;
      let fileName = fallback;
      let counter = 1;
      while (seen.has(fileName.toLowerCase())) {
        counter += 1;
        fileName = `${fallback}${counter}`;
      }
      seen.add(fileName.toLowerCase());
      return {
        displayName: scene,
        fileName,
      };
    });
};

const parsePackages = (input) => {
  if (!input) {
    return {};
  }

  if (Array.isArray(input)) {
    return input.reduce((acc, value) => {
      if (typeof value === "string") {
        const [name, version] = value.split("@");
        if (name && version) {
          acc[name.trim()] = version.trim();
        }
      } else if (value && typeof value === "object") {
        const { name, version } = value;
        if (typeof name === "string" && typeof version === "string") {
          acc[name.trim()] = version.trim();
        }
      }
      return acc;
    }, {});
  }

  if (typeof input === "object") {
    return Object.entries(input).reduce((acc, [name, version]) => {
      if (typeof version === "string" && version.trim()) {
        acc[name.trim()] = version.trim();
      }
      return acc;
    }, {});
  }

  return {};
};

const buildReadme = ({ projectName, description, scenes, packages }) => {
  const sceneLines = scenes
    .map((scene, index) => `- ${index + 1}. ${scene.displayName}`)
    .join("\n");

  const packageLines = Object.entries(packages)
    .map(([name, version]) => `- ${name}@${version}`)
    .join("\n");

  return `# ${projectName}\n\n` +
    `${description ? `${description}\n\n` : ""}` +
    `## Scenes\n${sceneLines || "- MainScene"}\n\n` +
    `## Packages\n${packageLines || "- com.unity.collab-proxy@2.0.6"}\n\n` +
    `## Next Steps\n` +
    `1. Open the project in Unity 2022.3 LTS (or newer).\n` +
    `2. Review \`BlackRoad/export.json\` for metadata captured during export.\n` +
    `3. Replace placeholder scenes in \`Assets/Scenes\` with real gameplay content.\n` +
    `4. Update \`Documentation/notes.md\` with design decisions and iteration history.\n`;
};

const buildScenePlaceholder = (scene, index) => {
  const baseId = 100000 + index * 100;
  const gameObjectId = baseId + 1;
  const transformId = baseId + 2;
  return `%YAML 1.1\n` +
    `%TAG !u! tag:unity3d.com,2011:\n` +
    `--- !u!1 &${gameObjectId}\n` +
    `GameObject:\n` +
    `  m_ObjectHideFlags: 0\n` +
    `  m_Name: ${scene.displayName}\n` +
    `  m_Component:\n` +
    `  - component: {fileID: ${transformId}}\n` +
    `  m_TransformParent: {fileID: 0}\n` +
    `  m_Layer: 0\n` +
    `  m_TagString: Untagged\n` +
    `  m_IsActive: 1\n` +
    `--- !u!4 &${transformId}\n` +
    `Transform:\n` +
    `  m_ObjectHideFlags: 0\n` +
    `  m_GameObject: {fileID: ${gameObjectId}}\n` +
    `  m_LocalScale: {x: 1, y: 1, z: 1}\n` +
    `  m_LocalPosition: {x: 0, y: 0, z: 0}\n` +
    `  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}\n` +
    `  m_Father: {fileID: 0}\n` +
    `  m_RootOrder: 0\n` +
    `  m_LocalEulerAnglesHint: {x: 0, y: 0, z: 0}\n`;
};

const buildEditorBuildSettings = (scenes) => {
  const sceneEntries = scenes
    .map(
      (scene) =>
        `  - enabled: 1\n` +
        `    path: Assets/Scenes/${scene.fileName}.unity\n` +
        `    guid: 00000000000000000000000000000000`
    )
    .join("\n");

  return `%YAML 1.1\n` +
    `%TAG !u! tag:unity3d.com,2011:\n` +
    `--- !u!1045 &1\n` +
    `EditorBuildSettings:\n` +
    `  m_ObjectHideFlags: 0\n` +
    `  serializedVersion: 2\n` +
    `  m_Scenes:\n${sceneEntries || "    - enabled: 1\n      path: Assets/Scenes/MainScene.unity\n      guid: 00000000000000000000000000000000"}\n` +
    `  m_configObjects: {}\n`;
};

const buildProjectSettings = (projectName) =>
  `%YAML 1.1\n` +
  `%TAG !u! tag:unity3d.com,2011:\n` +
  `--- !u!129 &1\n` +
  `PlayerSettings:\n` +
  `  productName: ${projectName}\n` +
  `  companyName: BlackRoad\n` +
  `  defaultScreenWidth: 1920\n` +
  `  defaultScreenHeight: 1080\n` +
  `  runInBackground: 1\n` +
  `  fullscreenMode: 1\n` +
  `  displayResolutionDialog: 0\n` +
  `  bundleVersion: 0.1.0\n` +
  `  defaultInterfaceOrientation: 3\n` +
  `  allowedAutorotateToPortrait: 1\n` +
  `  allowedAutorotateToPortraitUpsideDown: 1\n` +
  `  allowedAutorotateToLandscapeRight: 1\n` +
  `  allowedAutorotateToLandscapeLeft: 1\n` +
  `  usePlayerLog: 1\n` +
  `  resizableWindow: 1\n` +
  `  metalAPIValidation: 0\n` +
  `  useMacAppStoreValidation: 0\n`;

const manifestJson = (packages) =>
  JSON.stringify(
    {
      dependencies: packages,
      scopedRegistries: [
        {
          name: "BlackRoad",
          url: "https://packages.blackroad.dev",
          scopes: ["com.blackroad"],
        },
      ],
    },
    null,
    2
  );

const ensureDirectory = async (dir) => {
  await mkdir(dir, { recursive: true });
};

export const exportUnityProject = async (options = {}) => {
  const {
    projectName = "BlackRoadPrototype",
    description = "Autogenerated Unity scaffolding for rapid iteration.",
    author,
    scenes,
    notes,
    packages,
  } = options;

  if (typeof projectName !== "string" || !projectName.trim()) {
    throw new ExportError("projectName must be a non-empty string", 400);
  }

  const normalizedScenes = normalizeScenes(scenes);
  const packageOverrides = parsePackages(packages);
  const manifestPackages = { ...DEFAULT_PACKAGES, ...packageOverrides };

  await ensureDirectory(DOWNLOADS_ROOT);

  const slug = slugify(projectName);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const zipFileName = `${slug}-${timestamp}.zip`;
  const zipPath = path.join(DOWNLOADS_ROOT, zipFileName);

  const metadata = {
    projectName,
    slug,
    description,
    author: author || "Unknown",
    createdAt: new Date().toISOString(),
    scenes: normalizedScenes.map((scene) => ({
      name: scene.displayName,
      file: `Assets/Scenes/${scene.fileName}.unity`,
    })),
    packages: manifestPackages,
  };

  let bytesWritten = 0;

  await new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      bytesWritten = archive.pointer();
      resolve();
    });
    output.on("error", reject);

    archive.on("warning", (err) => {
      if (err.code === "ENOENT") {
        console.warn("archive warning", err);
      } else {
        reject(err);
      }
    });

    archive.on("error", reject);

    archive.pipe(output);

    const projectRoot = `${slug}/`;

    archive.append(buildReadme({ projectName, description, scenes: normalizedScenes, packages: manifestPackages }), {
      name: `${projectRoot}README.md`,
    });

    archive.append(JSON.stringify(metadata, null, 2), {
      name: `${projectRoot}BlackRoad/export.json`,
    });

    archive.append(notes ? `${notes}\n` : "Placeholder for design notes.\n", {
      name: `${projectRoot}Documentation/notes.md`,
    });

    archive.append(manifestJson(manifestPackages), {
      name: `${projectRoot}Packages/manifest.json`,
    });

    archive.append(buildProjectSettings(projectName), {
      name: `${projectRoot}ProjectSettings/ProjectSettings.asset`,
    });

    archive.append("m_EditorVersion: 2022.3.9f1\nm_EditorVersionWithRevision: 2022.3.9f1 (000000000000)\n", {
      name: `${projectRoot}ProjectSettings/ProjectVersion.txt`,
    });

    archive.append(buildEditorBuildSettings(normalizedScenes), {
      name: `${projectRoot}ProjectSettings/EditorBuildSettings.asset`,
    });

    normalizedScenes.forEach((scene, index) => {
      archive.append(buildScenePlaceholder(scene, index), {
        name: `${projectRoot}Assets/Scenes/${scene.fileName}.unity`,
      });
    });

    archive.append(
      "# Placeholder for core gameplay scripts\n// Add your C# MonoBehaviour scripts here.\n",
      {
        name: `${projectRoot}Assets/Scripts/README.md`,
      }
    );

    archive.finalize();
  });

  return {
    ok: true,
    path: zipPath,
    fileName: zipFileName,
    bytesWritten,
    project: metadata,
  };
};

app.post("/export", async (req, res) => {
  try {
    const result = await exportUnityProject(req.body ?? {});
    res.json(result);
  } catch (error) {
    const status = error?.status && Number.isInteger(error.status) ? error.status : 500;
    res.status(status).json({ ok: false, error: error?.message || "Unknown export error" });
  }
});

const DEFAULT_PROJECT_NAME = "BlackRoadUnitySample";

function sanitizeProjectName(name) {
  if (typeof name !== "string") return "";
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed.replace(/[^A-Za-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
}

function createUnityTemplateEntries(projectName) {
  return [
    { type: "dir", path: "Assets" },
    { type: "dir", path: "Assets/Scenes" },
    { type: "dir", path: "Assets/Scripts" },
    { type: "dir", path: "Packages" },
    { type: "dir", path: "ProjectSettings" },
    {
      type: "file",
      path: "README.md",
      content: `# ${projectName}\n\nGenerated by the BlackRoad Unity exporter.\n\nThis starter project contains a sample scene and basic project settings so you can immediately open it in Unity and begin iterating.`,
    },
    {
      type: "file",
      path: "ProjectSettings/ProjectVersion.txt",
      content: [
        "m_EditorVersion: 2022.3.17f1",
        "m_EditorVersionWithRevision: 2022.3.17f1 (revision 7dcf17075eb0)",
        "",
      ].join("\n"),
    },
    {
      type: "file",
      path: "ProjectSettings/ProjectSettings.asset",
      content: [
        "%YAML 1.1",
        "%TAG !u! tag:unity3d.com,2011:",
        "--- !u!129 &1",
        "PlayerSettings:",
        "  companyName: BlackRoad",
        `  productName: ${projectName}`,
        "  defaultScreenWidth: 1920",
        "  defaultScreenHeight: 1080",
        "  runInBackground: 1",
        "  resizableWindow: 1",
      ].join("\n"),
    },
    {
      type: "file",
      path: "Packages/manifest.json",
      content: JSON.stringify(
        {
          dependencies: {
            "com.unity.collab-proxy": "2.2.1",
            "com.unity.ide.vscode": "1.2.5",
            "com.unity.textmeshpro": "3.0.6",
            "com.unity.timeline": "1.7.5",
            "com.unity.ugui": "1.0.0",
            "com.unity.modules.ai": "1.0.0",
            "com.unity.modules.physics": "1.0.0",
            "com.unity.modules.ui": "1.0.0",
          },
        },
        null,
        2,
      ),
    },
    {
      type: "file",
      path: "Assets/Scenes/SampleScene.unity",
      content: [
        "%YAML 1.1",
        "%TAG !u! tag:unity3d.com,2011:",
        "--- !u!1 &1",
        "GameObject:",
        "  m_Name: Main Camera",
        "  m_TagString: MainCamera",
        "  m_Component:",
        "  - component: {fileID: 4}",
        "--- !u!4 &4",
        "Transform:",
        "  m_LocalPosition: {x: 0, y: 1, z: -10}",
        "  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}",
        "  m_LocalScale: {x: 1, y: 1, z: 1}",
        "--- !u!108 &10800001",
        "Camera:",
        "  m_ClearFlags: 1",
        "  m_BackGroundColor: {r: 0.192, g: 0.301, b: 0.475, a: 0}",
        "--- !u!1 &2",
        "GameObject:",
        "  m_Name: Directional Light",
        "  m_TagString: Untagged",
        "--- !u!108 &10800002",
        "Light:",
        "  m_Type: 1",
        "  m_Color: {r: 1, g: 0.956, b: 0.839, a: 1}",
      ].join("\n"),
    },
    {
      type: "file",
      path: "Assets/Scripts/Bootstrap.cs",
      content: [
        "using UnityEngine;",
        "",
        "public class Bootstrap : MonoBehaviour",
        "{",
        "    void Start()",
        "    {",
        "        Debug.Log(\"BlackRoad Unity exporter loaded Bootstrap script.\");",
        "    }",
        "}",
        "",
      ].join("\n"),
    },
  ];
}

async function writeZipArchive(zipPath, entries, projectName) {
  await rm(zipPath, { force: true });

  await new Promise((resolve, reject) => {
    const zipfile = new Yazl.ZipFile();
    const output = createWriteStream(zipPath);

    output.on("close", resolve);
    output.on("error", reject);
    zipfile.outputStream.on("error", reject);
    zipfile.outputStream.pipe(output);

    for (const entry of entries) {
      const entryPath = path.join(projectName, entry.path).replace(/\\/g, "/");
      if (entry.type === "dir") {
        zipfile.addEmptyDirectory(entryPath.endsWith("/") ? entryPath : `${entryPath}/`);
      } else {
        const buffer = Buffer.from(entry.content, "utf8");
        zipfile.addBuffer(buffer, entryPath);
      }
    }

    zipfile.end();
  });
}

export async function generateUnityProject({ projectName } = {}) {
  const safeName = sanitizeProjectName(projectName) || DEFAULT_PROJECT_NAME;
  const downloadsDir = path.join(process.cwd(), "downloads");
  await mkdir(downloadsDir, { recursive: true });

  const runId = randomUUID().split("-")[0];
  const fileName = `${safeName}-${runId}.zip`;
  const zipPath = path.join(downloadsDir, fileName);
  const entries = createUnityTemplateEntries(safeName);

  await writeZipArchive(zipPath, entries, safeName);

  return {
    ok: true,
    projectName: safeName,
    path: zipPath,
    relativePath: path.relative(process.cwd(), zipPath),
    files: entries
      .filter((entry) => entry.type === "file")
      .map((entry) => path.join(safeName, entry.path).replace(/\\/g, "/")),
  };
}

app.post("/export", async (req, res) => {
  try {
    const result = await generateUnityProject({ projectName: req.body?.projectName });
    res.json(result);
  } catch (error) {
    res.status(500).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});

const modulePath = fileURLToPath(import.meta.url);
if (process.argv[1] === modulePath) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log("unity exporter listening on", port));
}

export { app };
export default app;
  const trimmed = value.trim().slice(0, 64);
  const sanitized = trimmed.replace(/[^A-Za-z0-9 _-]/g, "");
  return sanitized.length > 0 ? sanitized : fallback;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "unity-project";
}

async function ensureTemplate() {
  try {
    await stat(TEMPLATE_DIR);
  } catch (error) {
    throw new Error(`Unity template missing at ${TEMPLATE_DIR}`);
  }
}

async function replaceTokens(dir, replacements) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await replaceTokens(fullPath, replacements);
      continue;
    }

    if (!isTextFile(entry.name)) {
      continue;
    }

    const original = await readFile(fullPath, "utf8");
    const updated = applyReplacements(original, replacements);
    if (updated !== original) {
      await writeFile(fullPath, updated, "utf8");
    }
  }
}

async function renamePlaceholders(dir, replacements) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const oldPath = path.join(dir, entry.name);
    const newName = applyReplacements(entry.name, replacements);
    const targetPath = newName !== entry.name ? path.join(dir, newName) : oldPath;

    if (newName !== entry.name) {
      await rename(oldPath, targetPath);
    }

    if (entry.isDirectory()) {
      await renamePlaceholders(targetPath, replacements);
function extractString(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sceneFileName(value) {
  const parts = value
    .split(/[^A-Za-z0-9]+/g)
    .filter(Boolean)
    .map(capitalize);
  if (!parts.length) {
    return "SampleScene";
  }
  return parts.join("");
}

function capitalize(segment) {
  if (!segment) {
    return "";
  }
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

function normalizeGuid(value) {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.replace(/[^a-fA-F0-9]/g, "").toLowerCase();
  return normalized.length === 32 ? normalized : null;
}

function makeGuid() {
  return randomUUID().replace(/-/g, "").toLowerCase();
}

async function replacePlaceholders(dir, replacements) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await replacePlaceholders(entryPath, replacements);
      continue;
    }

    let content = await readFile(entryPath, "utf8");
    let updated = content;
    for (const [token, replacement] of Object.entries(replacements)) {
      updated = updated.split(token).join(replacement);
    }
    if (updated !== content) {
      await writeFile(entryPath, updated, "utf8");
    }
  }
}

function applyReplacements(value, replacements) {
  let output = value;
  for (const [token, replacement] of Object.entries(replacements)) {
    output = output.split(token).join(replacement);
  }
  return output;
}

function isTextFile(filename) {
  return TEXT_EXTENSIONS.has(path.extname(filename).toLowerCase());
function normalizeExportOptions(body) {
  const options = typeof body === "object" && body !== null ? body : {};

  const projectName = normalizeName(options.projectName, DEFAULT_EXPORT.projectName);
  const projectSlug = slugify(projectName, "blackroad-prism-world");
  const sceneName = formatSceneName(options.sceneName, DEFAULT_EXPORT.sceneName);
  const sceneFile = `${sceneName}.unity`;

  return {
    projectName,
    projectSlug,
    sceneName,
    sceneFile,
    description: normalizeText(options.description, DEFAULT_EXPORT.description),
    author: normalizeText(options.author, DEFAULT_EXPORT.author)
  };
}

function normalizeName(value, fallback) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
}

function normalizeText(value, fallback) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
}

function slugify(value, fallback) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function formatSceneName(value, fallback) {
  if (typeof value !== "string") return fallback;
  const words = value
    .trim()
    .replace(/[^A-Za-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean);
  if (!words.length) return fallback;
  return words.map(capitalize).join("");
}

function capitalize(word) {
  if (!word.length) return word;
  return word[0].toUpperCase() + word.slice(1);
}

async function writeUnityProjectArchive(zipPath, config) {
  const generatedAt = new Date();
  const templateContext = {
    ...config,
    unityVersion: UNITY_VERSION,
    generatedAtIso: generatedAt.toISOString(),
    generatedAtEpoch: Math.floor(generatedAt.getTime() / 1000)
  };

  const files = buildUnityTemplateFiles(templateContext);

  await new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);

    for (const file of files) {
      archive.append(file.contents, { name: file.path });
    }

    archive.finalize();
  });

  return { filesWritten: files.length, generatedAt: templateContext.generatedAtIso };
}

function buildUnityTemplateFiles(context) {
  const sceneGuid = unityGuid(`${context.projectName}:${context.sceneName}:scene`);
  const scriptGuid = unityGuid(`${context.projectName}:${context.sceneName}:script`);
  const scenesFolderGuid = unityGuid(`${context.projectName}:${context.sceneName}:folder:scenes`);
  const scriptsFolderGuid = unityGuid(`${context.projectName}:${context.sceneName}:folder:scripts`);

  return [
    {
      path: "README.md",
      contents: buildReadme(context)
    },
    {
      path: ".gitignore",
      contents: buildGitignore()
    },
    {
      path: "ProjectSettings/ProjectVersion.txt",
      contents: buildProjectVersion(context.unityVersion)
    },
    {
      path: "ProjectSettings/ProjectSettings.asset",
      contents: buildProjectSettings(context)
    },
    {
      path: "ProjectSettings/EditorBuildSettings.asset",
      contents: buildEditorBuildSettings(context, sceneGuid)
    },
    {
      path: "Packages/manifest.json",
      contents: buildPackagesManifest()
    },
    {
      path: "Packages/packages-lock.json",
      contents: buildPackagesLock()
    },
    {
      path: "Assets/Scenes.meta",
      contents: buildFolderMeta(scenesFolderGuid, context.generatedAtEpoch)
    },
    {
      path: `Assets/Scenes/${context.sceneFile}`,
      contents: buildSceneFile(context, sceneGuid, scriptGuid)
    },
    {
      path: `Assets/Scenes/${context.sceneFile}.meta`,
      contents: buildSceneMeta(sceneGuid, context.generatedAtEpoch)
    },
    {
      path: "Assets/Scripts.meta",
      contents: buildFolderMeta(scriptsFolderGuid, context.generatedAtEpoch)
    },
    {
      path: "Assets/Scripts/SceneMetadata.cs",
      contents: buildSceneMetadataScript(context, sceneGuid)
    },
    {
      path: "Assets/Scripts/SceneMetadata.cs.meta",
      contents: buildScriptMeta(scriptGuid, context.generatedAtEpoch)
    }
  ];
}

function buildReadme(context) {
  return `# ${context.projectName}\n\n${context.description}\n\n- **Author:** ${context.author}\n- **Scene:** Assets/Scenes/${context.sceneFile}\n- **Unity Version:** ${context.unityVersion}\n- **Generated:** ${context.generatedAtIso}\n\nNext steps:\n1. Open the project folder in the Unity Hub.\n2. Import your assets and extend the \`${context.sceneName}\` scene.\n3. Replace the placeholder metadata behaviour with your own game logic.\n`;
}

function buildGitignore() {
  return `Library/\nTemp/\nObj/\nLogs/\nUserSettings/\nMemoryCaptures/\nBuild/\nBuilds/\nDerivedData/\n*.csproj\n*.unityproj\n*.sln\n*.suo\n*.user\n*.userprefs\n`;
}

function buildProjectVersion(version) {
  return `m_EditorVersion: ${version}\nm_EditorVersionWithRevision: ${version} (BlackRoad)\n`;
}

function buildProjectSettings(context) {
  return `%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:\n--- !u!129 &1\nPlayerSettings:\n  m_ObjectHideFlags: 0\n  serializedVersion: 23\n  productGUID: 00000000000000000000000000000000\n  AndroidProfiler: 0\n  companyName: ${yamlString(context.author)}\n  productName: ${yamlString(context.projectName)}\n  defaultCursor: {fileID: 0}\n  cursorHotspot: {x: 0, y: 0}\n  m_SplashScreenBackgroundColor: {r: 0.039, g: 0.039, b: 0.039, a: 1}\n  m_ShowUnitySplashScreen: 1\n  m_SplashScreenLogos: []\n  m_SplashScreenOverlayOpacity: 1\n  defaultScreenWidth: 1920\n  defaultScreenHeight: 1080\n  defaultScreenOrientation: 1\n  targetDevice: 2\n  useMacAppStoreValidation: 0\n  usePlayerLog: 1\n  runInBackground: 1\n  forceSingleInstance: 0\n  resizableWindow: 1\n  bundleVersion: 0.1.0\n  preloadedAssets: []\n`;
}

function buildEditorBuildSettings(context, sceneGuid) {
  return `%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:\n--- !u!1045 &1\nEditorBuildSettings:\n  m_ObjectHideFlags: 0\n  serializedVersion: 2\n  m_Scenes:\n  - enabled: 1\n    path: Assets/Scenes/${context.sceneFile}\n    guid: ${sceneGuid}\n  m_configObjects: {}\n`;
}

function buildPackagesManifest() {
  return `${JSON.stringify(
    {
      dependencies: {
        "com.unity.collab-proxy": "2.0.5",
        "com.unity.ide.rider": "3.0.24",
        "com.unity.ide.visualstudio": "2.0.22",
        "com.unity.ide.vscode": "1.2.5",
        "com.unity.render-pipelines.universal": "14.0.11",
        "com.unity.test-framework": "1.1.33",
        "com.unity.textmeshpro": "3.0.6",
        "com.unity.timeline": "1.7.5",
        "com.unity.ugui": "1.0.0"
      },
      registry: "https://packages.unity.com"
    },
    null,
    2
  )}\n`;
}

function buildPackagesLock() {
  return `${JSON.stringify({ dependencies: {} }, null, 2)}\n`;
}

function buildFolderMeta(guid, timestamp) {
  return `fileFormatVersion: 2\nguid: ${guid}\nfolderAsset: yes\ntimeCreated: ${timestamp}\nlicenseType: Free\nDefaultImporter:\n  externalObjects: {}\n  userData: \n  assetBundleName: \n  assetBundleVariant: \n`;
}

function buildSceneMeta(guid, timestamp) {
  return `fileFormatVersion: 2\nguid: ${guid}\ntimeCreated: ${timestamp}\nlicenseType: Free\nDefaultImporter:\n  externalObjects: {}\n  userData: \n  assetBundleName: \n  assetBundleVariant: \n`;
}

function buildScriptMeta(guid, timestamp) {
  return `fileFormatVersion: 2\nguid: ${guid}\ntimeCreated: ${timestamp}\nMonoImporter:\n  externalObjects: {}\n  serializedVersion: 2\n  defaultReferences: []\n  executionOrder: 0\n  icon: {instanceID: 0}\n  userData: \n  assetBundleName: \n  assetBundleVariant: \n`;
}

function buildSceneMetadataScript(context, sceneGuid) {
  return `using UnityEngine;\nusing UnityEngine.SceneManagement;\n\nnamespace BlackRoad.Prism.Unity\n{\n    [DisallowMultipleComponent]\n    public class SceneMetadata : MonoBehaviour\n    {\n        [TextArea]\n        [SerializeField] private string description = ${csharpString(context.description)};\n        [SerializeField] private string author = ${csharpString(context.author)};\n        [SerializeField] private string generatedAt = ${csharpString(context.generatedAtIso)};\n        [SerializeField] private string sceneName = ${csharpString(context.sceneName)};\n        [SerializeField] private string projectName = ${csharpString(context.projectName)};\n        [SerializeField] private string sceneGuid = ${csharpString(sceneGuid)};\n\n        private void Awake()\n        {\n            var activeScene = SceneManager.GetActiveScene();\n            if (string.IsNullOrEmpty(sceneName))\n            {\n                sceneName = activeScene.name;\n            }\n\n            if (string.IsNullOrEmpty(projectName))\n            {\n                projectName = Application.productName;\n            }\n\n            Debug.Log($"[SceneMetadata] {projectName}::{sceneName} generated at {generatedAt} by {author}. {description}");\n        }\n    }\n}\n`;
}

function buildSceneFile(context, sceneGuid, scriptGuid) {
  const ids = allocateSceneIds();
  const lines = [
    "%YAML 1.1",
    "%TAG !u! tag:unity3d.com,2011:",
    `--- !u!104 &${ids.renderSettings}`,
    "RenderSettings:",
    "  m_ObjectHideFlags: 0",
    "  serializedVersion: 9",
    "  m_Fog: 0",
    "  m_FogColor: {r: 0.5, g: 0.5, b: 0.5, a: 1}",
    "  m_FogMode: 3",
    "  m_FogDensity: 0.01",
    "  m_LinearFogStart: 0",
    "  m_LinearFogEnd: 300",
    "  m_AmbientSkyColor: {r: 0.212, g: 0.227, b: 0.259, a: 1}",
    "  m_AmbientEquatorColor: {r: 0.114, g: 0.125, b: 0.133, a: 1}",
    "  m_AmbientGroundColor: {r: 0.047, g: 0.043, b: 0.035, a: 1}",
    "  m_AmbientIntensity: 1",
    "  m_AmbientMode: 1",
    "  m_SubtractiveShadowColor: {r: 0.42, g: 0.478, b: 0.627, a: 1}",
    "  m_SkyboxMaterial: {fileID: 10304, guid: 0000000000000000f000000000000000, type: 0}",
    "  m_Sun: {fileID: 0}",
    "  m_IndirectSpecularColor: {r: 0.446579, g: 0.496413, b: 0.574817, a: 1}",
    "  m_UseRadianceAmbientProbe: 0",
    `--- !u!157 &${ids.lightmapSettings}`,
    "LightmapSettings:",
    "  m_ObjectHideFlags: 0",
    "  serializedVersion: 12",
    "  m_GIWorkflowMode: 1",
    "  m_GISettings:",
    "    serializedVersion: 2",
    "    m_BounceScale: 1",
    "    m_IndirectOutputScale: 1",
    "    m_AlbedoBoost: 1",
    "    m_EnvironmentLightingMode: 0",
    "  m_LightmapEditorSettings:",
    "    serializedVersion: 12",
    "    m_Resolution: 1",
    "    m_BakeResolution: 40",
    "    m_AtlasSize: 1024",
    "  m_LightingDataAsset: {fileID: 0}",
    "  m_UseShadowmask: 1",
    `--- !u!196 &${ids.navMeshSettings}`,
    "NavMeshSettings:",
    "  serializedVersion: 2",
    "  m_ObjectHideFlags: 0",
    "  m_BuildSettings:",
    "    serializedVersion: 2",
    "    agentTypeID: 0",
    "    agentRadius: 0.5",
    "    agentHeight: 2",
    "    agentSlope: 45",
    "    agentClimb: 0.4",
    "    minRegionArea: 2",
    "  m_NavMeshData: {fileID: 0}",
    `--- !u!1 &${ids.directionalLight.go}`,
function normalizeProjectName(name) {
  const cleaned = cleanLabel(name);
  return cleaned || DEFAULT_PROJECT_NAME;
}

function normalizeScenes(sceneInput) {
  const seen = new Set();
  const requested = Array.isArray(sceneInput)
    ? sceneInput
        .map((value) => cleanLabel(value))
        .filter((value) => value)
    : [];

  const picked = requested.length ? requested : DEFAULT_SCENES;

  return picked
    .filter((name) => {
      const key = name.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .map((displayName) => ({
      displayName,
      fileName: toSceneFileName(displayName),
      guid: unityGuid(),
    }));
}

function toSceneFileName(name) {
  const cleaned = name
    .replace(/[^A-Za-z0-9 _-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const safe = cleaned
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${safe || "Scene"}.unity`;
}

function toArchiveSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "unity-project";
}

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function createUnityArchive({ projectName, description, scenes, destination }) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const output = createWriteStream(destination);
  const completion = new Promise((resolve, reject) => {
    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);
  });

  archive.pipe(output);

  addReadme(archive, projectName, description);
  addProjectSettings(archive, scenes);
  addPackagesManifest(archive);
  const scriptGuid = addSampleScript(archive, projectName, description);
  addSceneFiles(archive, scenes, projectName, scriptGuid);

  archive.finalize();
  await completion;
}

function addReadme(archive, projectName, description) {
  const lines = [
    `# ${projectName}`,
    "",
    description ? description : "Generated Unity project stub created by the BlackRoad exporter.",
    "",
    "## Getting Started",
    "1. Unzip the archive into your Unity workspace.",
    "2. Open the project with Unity 2022.3 LTS or newer.",
    "3. Load the generated scene from `Assets/Scenes` to start iterating.",
    "",
    `Generated on ${new Date().toISOString()}.`,
  ];

  archive.append(lines.join("\n"), { name: "README.md" });
}

function addProjectSettings(archive, scenes) {
  archive.append(projectVersionContent(), {
    name: "ProjectSettings/ProjectVersion.txt",
  });

  archive.append(editorBuildSettingsContent(scenes), {
    name: "ProjectSettings/EditorBuildSettings.asset",
  });
}

function projectVersionContent() {
  return [
    "m_EditorVersion: 2022.3.16f1",
    "m_EditorVersionWithRevision: 2022.3.16f1 (c9b01bd14708)",
    "",
  ].join("\n");
}

function editorBuildSettingsContent(scenes) {
  const lines = ["m_ObjectHideFlags: 0", "serializedVersion: 2", "m_Scenes:"];
  if (!scenes.length) {
    lines.push("  []");
  } else {
    scenes.forEach((scene) => {
      lines.push("  - enabled: 1");
      lines.push(`    path: Assets/Scenes/${scene.fileName}`);
      lines.push(`    guid: ${scene.guid}`);
    });
  }
  lines.push("m_configObjects: {}");
  return lines.join("\n");
}

function addPackagesManifest(archive) {
  const manifest = {
    dependencies: {
      "com.unity.collab-proxy": "2.0.3",
      "com.unity.ide.visualstudio": "2.0.22",
      "com.unity.ide.rider": "3.0.20",
      "com.unity.ide.vscode": "1.2.5",
      "com.unity.test-framework": "1.3.9",
      "com.unity.textmeshpro": "3.0.6",
      "com.unity.timeline": "1.7.4",
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("unity exporter listening on", port));

async function createUnityTemplateZip({
  zipPath,
  projectName,
  sceneName,
  description,
}) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = createWriteStream(zipPath);
  const projectRoot = `${projectName}`;

  archive.on("warning", (warning) => {
    console.warn("Unity exporter warning", warning);
  });

  archive.on("error", (error) => {
    throw error;
  });

  archive.pipe(stream);

  const manifest = buildUnityManifest();
  const projectVersion = buildProjectVersion();
  const sceneContents = buildScene({
    sceneName,
    description,
    scriptGuid: WELCOME_SCRIPT_GUID,
  });
  const behaviourScript = buildBehaviourScript(sceneName);
  const behaviourScriptMeta = buildBehaviourScriptMeta(WELCOME_SCRIPT_GUID);

  archive.append(readmeContents({ projectName, sceneName, description }), {
    name: `${projectRoot}/README.md`,
  });
  archive.append(JSON.stringify(manifest, null, 2), {
    name: `${projectRoot}/Packages/manifest.json`,
  });
  archive.append(projectVersion, {
    name: `${projectRoot}/ProjectSettings/ProjectVersion.txt`,
  });
  archive.append(sceneContents, {
    name: `${projectRoot}/Assets/Scenes/${sceneName}.unity`,
  });
  archive.append(behaviourScript, {
    name: `${projectRoot}/Assets/Scripts/BlackRoadWelcome.cs`,
  });
  archive.append(behaviourScriptMeta, {
    name: `${projectRoot}/Assets/Scripts/BlackRoadWelcome.cs.meta`,
  });

  await archive.finalize();
  await finished(stream);
}

function sanitiseProjectName(value) {
  return String(value)
    .replace(/[^A-Za-z0-9_-]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50) || DEFAULT_PROJECT_NAME;
}

function sanitiseSceneName(value) {
  const sanitised = String(value)
    .replace(/[^A-Za-z0-9_-]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
  return sanitised || DEFAULT_SCENE_NAME;
}

function sanitiseDescription(value) {
  if (typeof value !== "string") {
    return DEFAULT_DESCRIPTION;
  }
  return value
    .replace(/\r?\n|\r/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 280) || DEFAULT_DESCRIPTION;
}

function buildUnityManifest() {
  return {
    dependencies: {
      "com.unity.ide.rider": "3.0.22",
      "com.unity.ide.visualstudio": "2.0.18",
      "com.unity.test-framework": "1.4.5",
      "com.unity.textmeshpro": "3.0.6",
      "com.unity.timeline": "1.7.6",
      "com.unity.ugui": "1.0.0",
    },
    registry: "https://packages.unity.com",
  };

  archive.append(`${JSON.stringify(manifest, null, 2)}\n`, {
    name: "Packages/manifest.json",
  });
}

function addSceneFiles(archive, scenes, projectName, scriptGuid) {
  scenes.forEach((scene) => {
    const sceneContent = unitySceneContent(scene.displayName, projectName, scriptGuid);
    archive.append(sceneContent, {
      name: `Assets/Scenes/${scene.fileName}`,
    });

    archive.append(defaultMetaFile(scene.guid), {
      name: `Assets/Scenes/${scene.fileName}.meta`,
    });
  });
}

function unitySceneContent(sceneName, projectName, scriptGuid) {
  const description = yamlString(`Generated by the BlackRoad Unity exporter for ${projectName}.`);
  return [
    "%YAML 1.1",
    "%TAG !u! tag:unity3d.com,2011:",
    "--- !u!29 &1",
    "SceneSettings:",
    "  m_ObjectHideFlags: 0",
    "  m_PVSData: \n",
    "  m_PVSObjectsArray: []",
    "  m_PVSPortalsArray: []",
    "--- !u!1 &100000",
    "GameObject:",
    "  m_ObjectHideFlags: 0",
    "  m_CorrespondingSourceObject: {fileID: 0}",
    "  m_PrefabInstance: {fileID: 0}",
    "  m_PrefabAsset: {fileID: 0}",
    "  serializedVersion: 6",
    "  m_Component:",
    `  - component: {fileID: ${ids.directionalLight.transform}}`,
    `  - component: {fileID: ${ids.directionalLight.light}}`,
    "  m_Layer: 0",
    "  m_Name: Directional Light",
    "  - component: {fileID: 400000}",
    "  - component: {fileID: 11400000}",
    "  m_Layer: 0",
    `  m_Name: ${sceneName}`,
    "  m_TagString: Untagged",
    "  m_Icon: {fileID: 0}",
    "  m_NavMeshLayer: 0",
    "  m_StaticEditorFlags: 0",
    "  m_IsActive: 1",
    `--- !u!4 &${ids.directionalLight.transform}`,
    "--- !u!4 &400000",
    "Transform:",
    "  m_ObjectHideFlags: 0",
    "  m_CorrespondingSourceObject: {fileID: 0}",
    "  m_PrefabInstance: {fileID: 0}",
    "  m_PrefabAsset: {fileID: 0}",
    `  m_GameObject: {fileID: ${ids.directionalLight.go}}`,
    "  m_LocalRotation: {x: 0.4082179, y: 0.4082179, z: 0.2345697, w: 0.8223631}",
    "  m_LocalPosition: {x: 0, y: 3, z: 0}",
    "  m_LocalScale: {x: 1, y: 1, z: 1}",
    "  m_ConstrainProportionsScale: 0",
    "  m_Children: []",
    "  m_Father: {fileID: 0}",
    "  m_RootOrder: 0",
    "  m_LocalEulerAnglesHint: {x: 50, y: -30, z: 0}",
    `--- !u!108 &${ids.directionalLight.light}`,
    "Light:",
    "  m_ObjectHideFlags: 0",
    `  m_GameObject: {fileID: ${ids.directionalLight.go}}`,
    "  m_Enabled: 1",
    "  serializedVersion: 10",
    "  m_Type: 1",
    "  m_Color: {r: 1, g: 0.95686275, b: 0.8392157, a: 1}",
    "  m_Intensity: 1",
    "  m_Shadows:",
    "    m_Type: 2",
    "    m_Resolution: -1",
    "    m_CustomResolution: -1",
    "    m_Strength: 1",
    "    m_Bias: 0.05",
    "    m_NormalBias: 0.4",
    "    m_NearPlane: 0.2",
    "  m_CookieSize: 10",
    "  m_DrawHalo: 0",
    "  m_Flare: {fileID: 0}",
    "  m_RenderMode: 0",
    "  m_CullingMask:",
    "    serializedVersion: 2",
    "    m_Bits: 4294967295",
    "  m_Lightmapping: 4",
    "  m_LightShadowCasterMode: 0",
    "  m_AreaSize: {x: 1, y: 1}",
    "  m_BounceIntensity: 1",
    "  m_ColorTemperature: 6570",
    "  m_UseColorTemperature: 0",
    "  m_BoundingSphereOverride: {x: 0, y: 0, z: 0, w: 0}",
    "  m_UseBoundingSphereOverride: 0",
    "  m_ShadowRadius: 0",
    "  m_ShadowAngle: 0",
    `--- !u!1 &${ids.camera.go}`,
    "GameObject:",
    "  m_ObjectHideFlags: 0",
    "  m_CorrespondingSourceObject: {fileID: 0}",
    "  m_PrefabInstance: {fileID: 0}",
    "  m_PrefabAsset: {fileID: 0}",
    "  serializedVersion: 6",
    "  m_Component:",
    `  - component: {fileID: ${ids.camera.transform}}`,
    `  - component: {fileID: ${ids.camera.camera}}`,
    `  - component: {fileID: ${ids.camera.audio}}`,
    "  m_Layer: 0",
    "  m_Name: Main Camera",
    "  m_TagString: MainCamera",
    "  m_Icon: {fileID: 0}",
    "  m_NavMeshLayer: 0",
    "  m_StaticEditorFlags: 0",
    "  m_IsActive: 1",
    `--- !u!4 &${ids.camera.transform}`,
    "Transform:",
    "  m_ObjectHideFlags: 0",
    "  m_CorrespondingSourceObject: {fileID: 0}",
    "  m_PrefabInstance: {fileID: 0}",
    "  m_PrefabAsset: {fileID: 0}",
    `  m_GameObject: {fileID: ${ids.camera.go}}`,
    "  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}",
    "  m_LocalPosition: {x: 0, y: 1, z: -10}",
    "  m_LocalScale: {x: 1, y: 1, z: 1}",
    "  m_ConstrainProportionsScale: 0",
    "  m_Children: []",
    "  m_Father: {fileID: 0}",
    "  m_RootOrder: 1",
    "  m_LocalEulerAnglesHint: {x: 0, y: 0, z: 0}",
    `--- !u!20 &${ids.camera.camera}`,
    "Camera:",
    "  m_ObjectHideFlags: 0",
    `  m_GameObject: {fileID: ${ids.camera.go}}`,
    "  m_Enabled: 1",
    "  serializedVersion: 2",
    "  m_ClearFlags: 1",
    "  m_BackGroundColor: {r: 0.19215687, g: 0.3019608, b: 0.4745098, a: 0}",
    "  m_projectionMatrixMode: 1",
    "  m_GateFitMode: 2",
    "  m_FOVAxisMode: 0",
    "  m_SensorSize: {x: 36, y: 24}",
    "  m_LensShift: {x: 0, y: 0}",
    "  m_FocalLength: 50",
    "  m_NormalizedViewPortRect:",
    "    serializedVersion: 2",
    "    x: 0",
    "    y: 0",
    "    width: 1",
    "    height: 1",
    "  near clip plane: 0.3",
    "  far clip plane: 1000",
    "  field of view: 60",
    "  orthographic: 0",
    "  orthographic size: 5",
    "  m_Depth: -1",
    "  m_CullingMask:",
    "    serializedVersion: 2",
    "    m_Bits: 4294967295",
    "  m_RenderingPath: -1",
    "  m_TargetTexture: {fileID: 0}",
    "  m_TargetDisplay: 0",
    "  m_TargetEye: 3",
    "  m_HDR: 1",
    "  m_AllowMSAA: 1",
    "  m_AllowDynamicResolution: 0",
    "  m_ForceIntoRT: 0",
    "  m_OcclusionCulling: 1",
    `--- !u!81 &${ids.camera.audio}`,
    "AudioListener:",
    "  m_ObjectHideFlags: 0",
    `  m_GameObject: {fileID: ${ids.camera.go}}`,
    "  m_Enabled: 1",
    `--- !u!1 &${ids.metadata.go}`,
    "GameObject:",
    "  m_ObjectHideFlags: 0",
    "  m_CorrespondingSourceObject: {fileID: 0}",
    "  m_PrefabInstance: {fileID: 0}",
    "  m_PrefabAsset: {fileID: 0}",
    "  serializedVersion: 6",
    "  m_Component:",
    `  - component: {fileID: ${ids.metadata.transform}}`,
    `  - component: {fileID: ${ids.metadata.behaviour}}`,
    "  m_Layer: 0",
    "  m_Name: Scene Metadata",
    "  m_TagString: Untagged",
    "  m_Icon: {fileID: 0}",
    "  m_NavMeshLayer: 0",
    "  m_StaticEditorFlags: 0",
    "  m_IsActive: 1",
    `--- !u!4 &${ids.metadata.transform}`,
    "Transform:",
    "  m_GameObject: {fileID: 100000}",
    "  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}",
    "  m_LocalPosition: {x: 0, y: 0, z: 0}",
    "  m_LocalScale: {x: 1, y: 1, z: 1}",
    "  m_Children: []",
    "  m_Father: {fileID: 0}",
    "  m_RootOrder: 0",
    "  m_LocalEulerAnglesHint: {x: 0, y: 0, z: 0}",
    "--- !u!114 &11400000",
    "MonoBehaviour:",
    "  m_ObjectHideFlags: 0",
    "  m_CorrespondingSourceObject: {fileID: 0}",
    "  m_PrefabInstance: {fileID: 0}",
    "  m_PrefabAsset: {fileID: 0}",
    `  m_GameObject: {fileID: ${ids.metadata.go}}`,
    "  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}",
    "  m_LocalPosition: {x: 0, y: 0, z: 0}",
    "  m_LocalScale: {x: 1, y: 1, z: 1}",
    "  m_ConstrainProportionsScale: 0",
    "  m_Children: []",
    "  m_Father: {fileID: 0}",
    "  m_RootOrder: 2",
    "  m_LocalEulerAnglesHint: {x: 0, y: 0, z: 0}",
    `--- !u!114 &${ids.metadata.behaviour}`,
    "MonoBehaviour:",
    "  m_ObjectHideFlags: 0",
    `  m_GameObject: {fileID: ${ids.metadata.go}}`,
    "  m_Enabled: 1",
    "  m_EditorHideFlags: 0",
    `  m_Script: {fileID: 11500000, guid: ${scriptGuid}, type: 3}`,
    "  m_Name: SceneMetadata",
    "  m_EditorClassIdentifier: ",
    formatYamlMultiline("description", context.description, 1),
    `  author: ${yamlString(context.author)}`,
    `  generatedAt: ${yamlString(context.generatedAtIso)}`,
    `  sceneName: ${yamlString(context.sceneName)}`,
    `  projectName: ${yamlString(context.projectName)}`,
    `  sceneGuid: ${yamlString(sceneGuid)}`,
    ""
  ];

  return lines.join("\n");
}

function formatYamlMultiline(key, value, indentLevel = 0) {
  const indent = "  ".repeat(indentLevel);
  if (!value) {
    return `${indent}${key}: ""`;
  }

  const lines = String(value).split(/\r?\n/);
  if (lines.length === 1) {
    return `${indent}${key}: ${yamlString(lines[0])}`;
  }

  const body = lines.map((line) => `${indent}  ${line}`).join("\n");
  return `${indent}${key}: |\n${body}`;
}

function yamlString(value) {
  const safe = String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${safe}"`;
}

function csharpString(value) {
  const safe = String(value)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, "\\n");
  return `"${safe}"`;
}

function unityGuid(seed) {
  return crypto.createHash("md5").update(seed).digest("hex");
}

function allocateSceneIds() {
  return {
    renderSettings: 10400000,
    lightmapSettings: 15700000,
    navMeshSettings: 19600000,
    directionalLight: { go: 11100000, transform: 11100001, light: 11100002 },
    camera: { go: 11200000, transform: 11200001, camera: 11200002, audio: 11200003 },
    metadata: { go: 11300000, transform: 11300001, behaviour: 11300002 }
  };
async function zipDirectory(root, folderName, destination) {
  await new Promise((resolve, reject) => {
    const zip = spawn("zip", ["-r", destination, folderName], { cwd: root });
    zip.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`zip exited with code ${code}`));
      }
    });
    zip.on("error", reject);
  });
}
app.listen(port, () => {
  console.log("Unity exporter listening on", port);
});

if (isMainModule(import.meta.url)) {
  app.listen(port, () => console.log("unity exporter listening on", port));
}

function resolveDownloadsDir() {
  const root = process.env.UNITY_EXPORT_ROOT;
  if (typeof root === "string" && root.trim()) {
    return path.join(path.resolve(root), "downloads");
  }
  return path.join(process.cwd(), "downloads");
}

function isMainModule(moduleUrl) {
  try {
    const modulePath = fileURLToPath(moduleUrl);
    return process.argv[1] === modulePath;
  } catch (error) {
    return false;
  }
}

function sanitiseIdentifier(value) {
    "  m_GameObject: {fileID: 100000}",
    "  m_Enabled: 1",
    "  m_EditorHideFlags: 0",
    `  m_Script: {fileID: 11500000, guid: ${scriptGuid}, type: 3}`,
    `  m_Name: ${projectName} Controller`,
    "  m_EditorClassIdentifier: ",
    `  Description: ${description}`,
    "  RotationSpeed: 30",
  ].join("\n") + "\n";
}

function addSampleScript(archive, projectName, description) {
  const script = sampleScriptContent(projectName, description);
  archive.append(script, {
    name: `Assets/Scripts/${SCRIPT_FILE}`,
  });

  const guid = unityGuid();
  archive.append(monoScriptMeta(guid), {
    name: `Assets/Scripts/${SCRIPT_FILE}.meta`,
  });
  return guid;
}

function sampleScriptContent(projectName, description) {
  const safeDescription = description?.replace(/`/g, "'") ?? "";
  const summary = safeDescription || "This script spins the attached object so you have a visual reference that play mode works.";
  const projectLiteral = escapeForCSharp(projectName);
  const descriptionLiteral = escapeForCSharp(description ?? "Welcome to your new Unity project!");
  return `using UnityEngine;\n\n/// <summary>\n/// Auto-generated scaffold for ${projectName}.\n/// ${summary}\n/// </summary>\n[AddComponentMenu("BlackRoad/Hello BlackRoad")]\npublic class HelloBlackRoad : MonoBehaviour\n{\n    [TextArea]\n    public string Description = "${descriptionLiteral}";\n\n    public float RotationSpeed = 30f;\n\n    private void Start()\n    {\n        Debug.Log($"${projectLiteral} booted successfully.");\n    }\n\n    private void Update()\n    {\n        transform.Rotate(Vector3.up * RotationSpeed * Time.deltaTime, Space.World);\n    }\n}\n`;
}

function escapeForCSharp(value) {
  const text = typeof value === "string" ? value : String(value);
  return text
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");
}

function monoScriptMeta(guid) {
}

function buildProjectVersion() {
  return [
    "m_EditorVersion: 2022.3.40f1",
    "m_EditorVersionWithRevision: 2022.3.40f1 (1234567890ab)",
  ].join("\n") + "\n";
}

function buildScene({ sceneName, description, scriptGuid }) {
  return [
    "%YAML 1.1",
    "%TAG !u! tag:unity3d.com,2011:",
    "--- !u!1045 &1",
    "SceneSettings:",
    "  m_ObjectHideFlags: 0",
    "  m_EditorData: {}",
    `  m_Description: ${description}`,
    "--- !u!1 &2",
    "GameObject:",
    `  m_Name: ${sceneName}`,
    "  m_Component:",
    "  - component: {fileID: 4}",
    "  - component: {fileID: 114}",
    "--- !u!4 &4",
    "Transform:",
    "  m_LocalPosition: {x: 0, y: 0, z: 0}",
    "  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}",
    "  m_LocalScale: {x: 1, y: 1, z: 1}",
    "--- !u!114 &114",
    "MonoBehaviour:",
    "  m_Name: BlackRoadWelcome",
    `  m_Script: {fileID: 11500000, guid: ${scriptGuid}, type: 3}`,
    `  message: Welcome to ${sceneName}!`,
    "",
  ].join("\n");
}

function buildBehaviourScript(sceneName) {
  return [
    "using UnityEngine;",
    "",
    "namespace BlackRoad.Generated {",
    "  public class BlackRoadWelcome : MonoBehaviour {",
    `    [SerializeField] private string message = "Welcome to ${sceneName}!";`,
    "",
    "    private void Start() {",
    "      Debug.Log(message);",
    "    }",
    "  }",
    "}",
    "",
  ].join("\n");
}

function buildBehaviourScriptMeta(guid) {
  return [
    "fileFormatVersion: 2",
    `guid: ${guid}`,
    "MonoImporter:",
    "  externalObjects: {}",
    "  serializedVersion: 2",
    "  defaultReferences: []",
    "  executionOrder: 0",
    "  icon: {instanceID: 0}",
    "  userData: ",
    "  assetBundleName: ",
    "  assetBundleVariant: ",
  ].join("\n") + "\n";
}

function defaultMetaFile(guid) {
  return [
    "fileFormatVersion: 2",
    `guid: ${guid}`,
    "DefaultImporter:",
    "  externalObjects: {}",
    "  userData: ",
    "  assetBundleName: ",
    "  assetBundleVariant: ",
  ].join("\n") + "\n";
}

function unityGuid() {
  return randomUUID().replace(/-/g, "").toLowerCase();
}

function yamlString(value) {
  const text = typeof value === "string" ? value : String(value);
  return `"${text
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")}"`;
}

function cleanLabel(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normaliseText(value, fallback) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return fallback;
}

function buildScenes(input) {
  const scenes = Array.isArray(input) && input.length > 0
    ? input.map((scene, index) => {
      if (typeof scene === "string") {
        return {
          name: scene,
          description: "Generated from request payload",
        };
    }

    if (scene && typeof scene === "object") {
      const name = normaliseText(scene.name, `Scene${index + 1}`);
      return {
        name,
        description: normaliseText(
          scene.description,
          "Generated from request payload",
        ),
        enabled: scene.enabled !== false,
      };
    }

    return {
      name: `Scene${index + 1}`,
      description: "Generated from request payload",
    };
    })
    : DEFAULT_SCENES.map((scene) => ({ ...scene }));

  const hasEnabled = scenes.some((scene) => scene.enabled !== false);
  if (!hasEnabled && scenes.length > 0) {
    scenes[0].enabled = true;
  }

  return scenes.map((scene, index) => {
    const fileName = sanitiseIdentifier(scene.name) || `Scene${index + 1}`;
    return {
      name: scene.name,
      description: scene.description,
      enabled: scene.enabled !== false,
      fileName,
    };
  });
}

function buildDependencies(input) {
  const dependencies = { ...DEFAULT_DEPENDENCIES };
  const requestedPackages = [];

  if (!Array.isArray(input)) {
    return { dependencies, requestedPackages };
  }

  input.forEach((entry) => {
    if (typeof entry === "string") {
      const name = entry.trim();
      if (!name) {
        return;
      }
      dependencies[name] = dependencies[name] || "latest";
      requestedPackages.push({ name, version: dependencies[name] });
      return;
    }

    if (entry && typeof entry === "object") {
      const name = normaliseText(entry.name, "");
      if (!name) {
        return;
      }
      const version = normaliseText(entry.version, "latest");
      dependencies[name] = version;
      requestedPackages.push({ name, version });
    }
  });

  return { dependencies, requestedPackages };
}

async function writeScenes(workspaceDir, scenes) {
  const sceneEntries = [];

  await Promise.all(
    scenes.map(async (scene, index) => {
      const sceneFileName = `${scene.fileName}.unity`;
      const scenePath = path.join(
        workspaceDir,
        "Assets",
        "Scenes",
        sceneFileName,
      );

      await writeFile(
        scenePath,
        createSceneTemplate(scene.name, scene.description),
        "utf8",
      );

      sceneEntries.push({
        name: scene.name,
        path: `Assets/Scenes/${sceneFileName}`,
        enabled: scene.enabled !== false,
      });
    }),
  );

  return sceneEntries.sort((a, b) => a.name.localeCompare(b.name));
}

function createManifest(dependencies) {
  return `${JSON.stringify(
    {
      manifestVersion: 2,
      dependencies,
      registry: "https://packages.unity.com",
    },
    null,
    2,
  )}\n`;
}

function createProjectVersion(unityVersion) {
  return `m_EditorVersion: ${unityVersion}\nm_EditorVersionWithRevision: ${unityVersion} (stub)\n`;
}

function createEditorBuildSettings(sceneEntries) {
  const sceneLines = sceneEntries
    .map(
      (scene) => `    - enabled: ${scene.enabled ? 1 : 0}\n      path: ${scene.path}\n      guid: 00000000000000000000000000000000`,
    )
    .join("\n");

  return `%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:\n--- !u!1045 &1\nEditorBuildSettings:\n  m_ObjectHideFlags: 0\n  serializedVersion: 2\n  m_Scenes:\n${sceneLines || "    []"}\n`;
}

function createProjectSettings({ company, product }) {
  return `%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:\n--- !u!129 &1\nPlayerSettings:\n  m_ObjectHideFlags: 0\n  serializedVersion: 24\n  productGUID: 00000000000000000000000000000000\n  AndroidProfiler: 0\n  companyName: ${company}\n  productName: ${product}\n  defaultScreenWidth: 1920\n  defaultScreenHeight: 1080\n  runInBackground: 1\n`;
}

function createSceneTemplate(sceneName, description) {
  return `// ${sceneName}\n// ${description}\n%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:\n--- !u!1 &1\nGameObject:\n  m_ObjectHideFlags: 0\n  m_Name: ${sceneName}\n  m_TagString: Untagged\n  m_Component:\n  - component: {fileID: 4}\n  m_Layer: 0\n  m_IsActive: 1\n--- !u!4 &4\nTransform:\n  m_ObjectHideFlags: 0\n  m_GameObject: {fileID: 1}\n  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}\n  m_LocalPosition: {x: 0, y: 0, z: 0}\n  m_LocalScale: {x: 1, y: 1, z: 1}\n  m_Children: []\n`;
}

function createReadme({
  projectName,
  companyName,
  productName,
  unityVersion,
  scenes,
  packages,
}) {
  const sceneList = scenes
    .map((scene) => `- ${scene.name}${scene.enabled === false ? " (disabled)" : ""}`)
    .join("\n");

  const packageList = Object.entries(packages)
    .map(([name, version]) => `- ${name}: ${version}`)
    .join("\n");

  return `# ${projectName}\n\n- Company: ${companyName}\n- Product: ${productName}\n- Unity Version: ${unityVersion}\n\n## Scenes\n\n${sceneList || "(none)"}\n\n## Packages\n\n${packageList || "(none)"}\n\n## Getting Started\n\n1. Open Unity Hub and click **Add project from disk**.\n2. Select the extracted folder from this archive.\n3. When prompted, ensure Unity ${unityVersion} (or newer) is installed.\n\nThis starter layout was generated automatically by the BlackRoad Unity exporter.\n`;
}

export {
  app,
  buildDependencies,
  buildScenes,
  createEditorBuildSettings,
  createManifest,
  createProjectSettings,
  createProjectVersion,
  createReadme,
  createSceneTemplate,
  normaliseText,
  sanitiseIdentifier,
};

export default app;
app.listen(port, () => console.log('unity exporter listening on', port));
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^A-Za-z0-9 _\-\.()]/g, "")
    .trim()
    .slice(0, 80);
    "  userData:",
    "  assetBundleName:",
    "  assetBundleVariant:",
    "",
  ].join("\n");
}

function readmeContents({ projectName, sceneName, description }) {
  return [
    `# ${projectName}`,
    "",
    description,
    "",
    "## Getting Started",
    "",
    "1. Open the project in Unity 2022.3 LTS or newer.",
    `2. Load the scene located at Assets/Scenes/${sceneName}.unity.`,
    "3. Press Play to verify the autogenerated welcome script logs in the Console.",
    "",
    "This template was generated by the BlackRoad Unity exporter worker.",
    "",
  ].join("\n");
}
