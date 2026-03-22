const DEFAULT_PROJECT_NAME = "BlackRoadUnitySample";
const DEFAULT_SCENE_NAME = "SampleScene";
const DEFAULT_EDITOR_VERSION = "2022.3.17f1";
const DEFAULT_EDITOR_REVISION = "2022.3.17f1 (b43b7c2c99ba)";

const sanitizeName = (value, fallback) => {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }
  const cleaned = trimmed.replace(/[^A-Za-z0-9 _-]+/g, "");
  if (!cleaned) {
    return fallback;
  }
  return cleaned.replace(/\s+/g, "_");
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unity-project";

const createSceneContent = (sceneName) => `%%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!29 &1
OcclusionCullingSettings:
  m_ObjectHideFlags: 0
  serializedVersion: 2
  m_OcclusionBakeSettings:
    smallestOccluder: 5
    smallestHole: 0.25
    backfaceThreshold: 100
  m_SceneGUID: 00000000000000000000000000000000
  m_OcclusionCullingData: {fileID: 0}
--- !u!104 &2
RenderSettings:
  m_ObjectHideFlags: 0
  serializedVersion: 9
  m_Fog: 0
  m_FogColor: {r: 0.5, g: 0.5, b: 0.5, a: 1}
  m_FogMode: 3
  m_FogDensity: 0.01
  m_LinearFogStart: 0
  m_LinearFogEnd: 300
  m_AmbientSkyColor: {r: 0.212, g: 0.227, b: 0.259, a: 1}
  m_AmbientEquatorColor: {r: 0.114, g: 0.125, b: 0.133, a: 1}
  m_AmbientGroundColor: {r: 0.047, g: 0.043, b: 0.035, a: 1}
  m_AmbientIntensity: 1
  m_AmbientMode: 0
  m_SubtractiveShadowColor: {r: 0.42, g: 0.478, b: 0.627, a: 1}
  m_SkyboxMaterial: {fileID: 10304, guid: 0000000000000000f000000000000000, type: 0}
  m_HaloStrength: 0.5
  m_FlareStrength: 1
  m_FlareFadeSpeed: 3
  m_HaloTexture: {fileID: 0}
  m_SpotCookie: {fileID: 10001, guid: 0000000000000000e000000000000000, type: 0}
  m_DefaultReflectionMode: 0
  m_DefaultReflectionResolution: 128
  m_ReflectionBounces: 1
  m_ReflectionIntensity: 1
  m_CustomReflection: {fileID: 0}
  m_Sun: {fileID: 0}
  m_IndirectSpecularColor: {r: 0.44657898, g: 0.4964133, b: 0.5748178, a: 1}
  m_UseRadianceAmbientProbe: 0
--- !u!157 &3
LightmapSettings:
  m_ObjectHideFlags: 0
  serializedVersion: 12
  m_GIWorkflowMode: 1
  m_GISettings:
    serializedVersion: 2
    m_BounceScale: 1
    m_IndirectOutputScale: 1
    m_AlbedoBoost: 1
    m_EnvironmentLightingMode: 0
    m_EnableBakedLightmaps: 1
    m_EnableRealtimeLightmaps: 0
  m_LightmapEditorSettings:
    serializedVersion: 12
    m_Resolution: 2
    m_BakeResolution: 40
    m_AtlasSize: 1024
    m_AO: 0
    m_AOMaxDistance: 1
    m_CompAOExponent: 1
    m_CompAOExponentDirect: 0
    m_Padding: 2
    m_LightmapParameters: {fileID: 0}
    m_LightmapsBakeMode: 1
    m_TextureCompression: 1
    m_FinalGather: 0
    m_FinalGatherFiltering: 1
    m_FinalGatherRayCount: 256
    m_ReflectionCompression: 2
    m_MixedBakeMode: 2
    m_BakeBackend: 1
    m_PVRSampling: 1
    m_PVRDirectSampleCount: 32
    m_PVRSampleCount: 500
    m_PVRBounces: 2
    m_PVREnvironmentSampleCount: 256
    m_PVREnvironmentReferencePointCount: 2048
    m_PVRFilteringMode: 1
    m_PVRDenoiserTypeDirect: 1
    m_PVRDenoiserTypeIndirect: 1
    m_PVRDenoiserTypeAO: 1
    m_PVRFilterTypeDirect: 0
    m_PVRFilterTypeIndirect: 0
    m_PVRFilterTypeAO: 0
    m_PVREnvironmentMIS: 0
    m_PVRCulling: 1
    m_PVRFilteringGaussRadiusDirect: 1
    m_PVRFilteringGaussRadiusIndirect: 5
    m_PVRFilteringGaussRadiusAO: 2
    m_PVRFilteringAtrousPositionSigmaDirect: 0.5
    m_PVRFilteringAtrousPositionSigmaIndirect: 2
    m_PVRFilteringAtrousPositionSigmaAO: 1
    m_ExportTrainingData: 0
    m_TrainingDataDestination: TrainingData
    m_LightProbeSampleCountMultiplier: 4
  m_LightingDataAsset: {fileID: 0}
  m_UseShadowmask: 1
--- !u!196 &4
NavMeshSettings:
  serializedVersion: 2
  m_ObjectHideFlags: 0
  m_BuildSettings:
    serializedVersion: 2
    agentTypeID: 0
    agentRadius: 0.5
    agentHeight: 2
    agentSlope: 45
    agentClimb: 0.4
    ledgeDropHeight: 0
    maxJumpAcrossDistance: 0
    minRegionArea: 2
    manualCellSize: 0
    cellSize: 0.16666667
    manualTileSize: 0
    tileSize: 256
    accuratePlacement: 0
    maxJobWorkers: 0
    preserveTilesOutsideBounds: 0
    debug:
      m_Flags: 0
  m_NavMeshData: {fileID: 0}
--- !u!1 &1000
GameObject:
  m_ObjectHideFlags: 0
  serializedVersion: 6
  m_Component:
  - component: {fileID: 1001}
  - component: {fileID: 1002}
  m_Layer: 0
  m_Name: ${sceneName}_Origin
  m_TagString: Untagged
  m_Icon: {fileID: 0}
  m_NavMeshLayer: 0
  m_StaticEditorFlags: 0
  m_IsActive: 1
--- !u!4 &1001
Transform:
  m_ObjectHideFlags: 0
  m_GameObject: {fileID: 1000}
  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}
  m_LocalPosition: {x: 0, y: 0, z: 0}
  m_LocalScale: {x: 1, y: 1, z: 1}
  m_ConstrainProportionsScale: 0
  m_Children:
  - {fileID: 2001}
  - {fileID: 3001}
  m_Father: {fileID: 0}
  m_RootOrder: 0
  m_LocalEulerAnglesHint: {x: 0, y: 0, z: 0}
--- !u!1 &2000
GameObject:
  m_ObjectHideFlags: 0
  serializedVersion: 6
  m_Component:
  - component: {fileID: 2001}
  - component: {fileID: 2002}
  - component: {fileID: 2003}
  m_Layer: 0
  m_Name: Main Camera
  m_TagString: MainCamera
  m_Icon: {fileID: 0}
  m_NavMeshLayer: 0
  m_StaticEditorFlags: 0
  m_IsActive: 1
--- !u!4 &2001
Transform:
  m_ObjectHideFlags: 0
  m_GameObject: {fileID: 2000}
  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}
  m_LocalPosition: {x: 0, y: 1, z: -10}
  m_LocalScale: {x: 1, y: 1, z: 1}
  m_ConstrainProportionsScale: 0
  m_Children: []
  m_Father: {fileID: 1001}
  m_RootOrder: 0
  m_LocalEulerAnglesHint: {x: 0, y: 0, z: 0}
--- !u!20 &2002
Camera:
  m_ObjectHideFlags: 0
  m_GameObject: {fileID: 2000}
  serializedVersion: 2
  m_Enabled: 1
  m_ClearFlags: 1
  m_BackGroundColor: {r: 0.19215687, g: 0.3019608, b: 0.4745098, a: 0}
  m_projectionMatrixMode: 1
  m_GateFitMode: 2
  m_FOVAxisMode: 0
  m_SensorSize: {x: 36, y: 24}
  m_LensShift: {x: 0, y: 0}
  m_FocalLength: 50
  m_NormalizedViewPortRect:
    serializedVersion: 2
    x: 0
    y: 0
    width: 1
    height: 1
  near clip plane: 0.3
  far clip plane: 1000
  field of view: 60
  orthographic: 0
  orthographic size: 5
  m_Depth: 0
  m_CullingMask:
    serializedVersion: 2
    m_Bits: 4294967295
  m_RenderingPath: -1
  m_TargetTexture: {fileID: 0}
  m_TargetDisplay: 0
  m_TargetEye: 3
  m_HDR: 1
  m_AllowMSAA: 1
  m_AllowDynamicResolution: 0
  m_ForceIntoRT: 0
  m_OcclusionCulling: 1
  m_StereoConvergence: 10
  m_StereoSeparation: 0.022
--- !u!81 &2003
AudioListener:
  m_ObjectHideFlags: 0
  m_GameObject: {fileID: 2000}
  m_Enabled: 1
--- !u!1 &3000
GameObject:
  m_ObjectHideFlags: 0
  serializedVersion: 6
  m_Component:
  - component: {fileID: 3001}
  - component: {fileID: 3002}
  m_Layer: 0
  m_Name: Directional Light
  m_TagString: Untagged
  m_Icon: {fileID: 0}
  m_NavMeshLayer: 0
  m_StaticEditorFlags: 0
  m_IsActive: 1
--- !u!4 &3001
Transform:
  m_ObjectHideFlags: 0
  m_GameObject: {fileID: 3000}
  m_LocalRotation: {x: 0.40821788, y: -0.23456968, z: 0.10938163, w: 0.8754261}
  m_LocalPosition: {x: 0, y: 3, z: 0}
  m_LocalScale: {x: 1, y: 1, z: 1}
  m_ConstrainProportionsScale: 0
  m_Children: []
  m_Father: {fileID: 1001}
  m_RootOrder: 1
  m_LocalEulerAnglesHint: {x: 50, y: -30, z: 0}
--- !u!108 &3002
Light:
  m_ObjectHideFlags: 0
  m_GameObject: {fileID: 3000}
  serializedVersion: 10
  m_Type: 1
  m_Color: {r: 1, g: 0.95686275, b: 0.8392157, a: 1}
  m_Intensity: 1
  m_Range: 10
  m_SpotAngle: 30
  m_InnerSpotAngle: 21.80208
  m_CookieSize: 10
  m_Shadows:
    m_Type: 2
    m_Resolution: -1
    m_CustomResolution: -1
    m_Strength: 1
    m_Bias: 0.05
    m_NormalBias: 0.4
    m_NearPlane: 0.2
  m_Cookie: {fileID: 0}
  m_DrawHalo: 0
  m_Flare: {fileID: 0}
  m_RenderMode: 0
  m_CullingMask:
    serializedVersion: 2
    m_Bits: 4294967295
  m_Lightmapping: 4
  m_LightShadowCasterMode: 0
  m_AreaSize: {x: 1, y: 1}
  m_BounceIntensity: 1
  m_ColorTemperature: 6570
  m_UseColorTemperature: 0
  m_BoundingSphereOverride: {x: 0, y: 0, z: 0, w: 0}
  m_UseBoundingSphereOverride: 0
  m_ShadowRadius: 0
  m_ShadowAngle: 0
`;

const createManifest = () => `{
  "manifestVersion": 1,
  "dependencies": {
    "com.unity.collab-proxy": "2.0.7",
    "com.unity.ide.visualstudio": "2.0.22",
    "com.unity.test-framework": "1.3.9",
    "com.unity.textmeshpro": "3.0.6",
    "com.unity.timeline": "1.7.6",
    "com.unity.ugui": "1.0.0",
    "com.unity.modules.ai": "1.0.0",
    "com.unity.modules.animation": "1.0.0",
    "com.unity.modules.audio": "1.0.0",
    "com.unity.modules.physics": "1.0.0",
    "com.unity.modules.physics2d": "1.0.0",
    "com.unity.modules.ui": "1.0.0",
    "com.unity.modules.unitywebrequest": "1.0.0"
  }
}
`;

const createReadme = (projectName, sceneName) => `# ${projectName}

This template was generated automatically by the BlackRoad Unity exporter.

## Getting Started

1. Open the project folder in the Unity Hub and use editor version ${DEFAULT_EDITOR_VERSION} (or newer).
2. Load the scene located at **Assets/Scenes/${sceneName}.unity**.
3. Press Play to verify the default camera and directional light setup.
4. Attach the \`HelloBlackRoad\` script to any GameObject to log a greeting on play mode start.
`;

const createHelloScript = () => `using UnityEngine;

public class HelloBlackRoad : MonoBehaviour
{
    void Start()
    {
        Debug.Log("Hello from the BlackRoad Unity template!");
    }
}
`;

export const buildUnityTemplate = ({ projectName, sceneName } = {}) => {
  const safeProjectName = sanitizeName(projectName, DEFAULT_PROJECT_NAME);
  const safeSceneName = sanitizeName(sceneName, DEFAULT_SCENE_NAME);
  const slug = slugify(safeProjectName);

  const root = safeProjectName;
  const files = [
    {
      path: `${root}/ProjectSettings/ProjectVersion.txt`,
      content: `m_EditorVersion: ${DEFAULT_EDITOR_VERSION}\nm_EditorVersionWithRevision: ${DEFAULT_EDITOR_REVISION}\n`,
    },
    {
      path: `${root}/Packages/manifest.json`,
      content: createManifest(),
    },
    {
      path: `${root}/Assets/Scenes/${safeSceneName}.unity`,
      content: createSceneContent(safeSceneName),
    },
    {
      path: `${root}/Assets/Scripts/HelloBlackRoad.cs`,
      content: createHelloScript(),
    },
    {
      path: `${root}/Assets/Readme.md`,
      content: createReadme(safeProjectName, safeSceneName),
    },
    {
      path: `${root}/ProjectSettings/ProjectSettings.asset`,
      content: `PlayerSettings:\n  companyName: BlackRoad\n  productName: ${safeProjectName}\n  defaultScreenWidth: 1920\n  defaultScreenHeight: 1080\n  runInBackground: 1\n`,
    },
  ];

  return {
    projectName: safeProjectName,
    sceneName: safeSceneName,
    slug,
    files,
  };
};
import { randomUUID } from 'crypto';

export const UNITY_VERSION = '2022.3.5f1';
export const DEFAULT_PROJECT_NAME = 'BlackRoadSample';
export const DEFAULT_SCENE_NAME = 'MainScene';

export function sanitizeName(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const cleaned = value
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned.length > 0 ? cleaned : fallback;
}

export function buildUnityTemplate({ projectName, sceneName }) {
  const sceneGuid = generateGuid();
  const scriptGuid = generateGuid();

  const files = new Map();
  files.set(
    'README.md',
    `# ${projectName}\n\n` +
      `This project was generated by the BlackRoad Unity exporter.\n\n` +
      `## Getting Started\n` +
      `1. Open the project in Unity ${UNITY_VERSION} or newer.\n` +
      `2. Load **Assets/Scenes/${sceneName}.unity**.\n` +
      `3. Press Play to see the sample scene and script output in the console.\n`
  );

  files.set(
    'ProjectSettings/ProjectVersion.txt',
    `m_EditorVersion: ${UNITY_VERSION}\n` +
      `m_EditorVersionWithRevision: ${UNITY_VERSION} (BlackRoad.LTS)\n`
  );

  files.set(
    'ProjectSettings/EditorBuildSettings.asset',
    `%YAML 1.1\n` +
      `%TAG !u! tag:unity3d.com,2011:\n` +
      `--- !u!1045 &1\n` +
      `EditorBuildSettings:\n` +
      `  m_ObjectHideFlags: 0\n` +
      `  serializedVersion: 2\n` +
      `  m_Scenes:\n` +
      `  - enabled: 1\n` +
      `    path: Assets/Scenes/${sceneName}.unity\n` +
      `    guid: ${sceneGuid}\n` +
      `  m_configObjects: {}\n`
  );

  files.set(
    'ProjectSettings/ProjectSettings.asset',
    `%YAML 1.1\n` +
      `%TAG !u! tag:unity3d.com,2011:\n` +
      `--- !u!129 &1\n` +
      `PlayerSettings:\n` +
      `  m_ObjectHideFlags: 0\n` +
      `  serializedVersion: 24\n` +
      `  companyName: BlackRoad\n` +
      `  productName: ${projectName}\n` +
      `  defaultScreenWidth: 1920\n` +
      `  defaultScreenHeight: 1080\n` +
      `  fullscreenMode: 1\n` +
      `  activeInputHandler: 0\n` +
      `  runInBackground: 1\n` +
      `  captureSingleScreen: 0\n` +
      `  companyNameLegacy: BlackRoad\n` +
      `  productNameLegacy: ${projectName}\n`
  );

  files.set(
    'Packages/manifest.json',
    `${JSON.stringify(buildManifest(projectName), null, 2)}\n`
  );

  files.set(`Assets/Scenes/${sceneName}.unity`, buildSceneContents());

  files.set(
    `Assets/Scenes/${sceneName}.unity.meta`,
    buildDefaultMeta(sceneGuid)
  );

  files.set(
    'Assets/Scripts/HelloBlackRoad.cs',
    `using UnityEngine;\n\n` +
      `public class HelloBlackRoad : MonoBehaviour\n` +
      `{\n` +
      `    void Start()\n` +
      `    {\n` +
      `        Debug.Log("${projectName} scene '${sceneName}' is ready.");\n` +
      `    }\n` +
      `}\n`
  );

  files.set(
    'Assets/Scripts/HelloBlackRoad.cs.meta',
    buildScriptMeta(scriptGuid)
  );

  files.set(
    '.gitignore',
    `Library/\nLogs/\nTemp/\nObj/\nBuild/\nBuilds/\nUserSettings/\n\n` +
      `# Generated by Unity\n` +
      `*.csproj\n*.sln\n*.user\n`
  );

  const instructions = {
    projectName,
    sceneName,
    sceneGuid,
    scriptGuid,
  };

  return { files, instructions };
}

function buildManifest(projectName) {
  return {
    dependencies: {
      'com.unity.collab-proxy': '2.0.3',
      'com.unity.ide.rider': '3.0.24',
      'com.unity.ide.visualstudio': '2.0.22',
      'com.unity.ide.vscode': '1.2.5',
      'com.unity.test-framework': '1.3.3',
      'com.unity.textmeshpro': '3.0.6',
      'com.unity.timeline': '1.7.6',
      'com.unity.ugui': '1.0.0',
      'com.unity.modules.ai': '1.0.0',
      'com.unity.modules.animation': '1.0.0',
      'com.unity.modules.audio': '1.0.0',
      'com.unity.modules.director': '1.0.0',
      'com.unity.modules.imageconversion': '1.0.0',
      'com.unity.modules.imgui': '1.0.0',
      'com.unity.modules.jsonserialize': '1.0.0',
      'com.unity.modules.particlesystem': '1.0.0',
      'com.unity.modules.physics': '1.0.0',
      'com.unity.modules.physics2d': '1.0.0',
      'com.unity.modules.screencapture': '1.0.0',
      'com.unity.modules.terrain': '1.0.0',
      'com.unity.modules.tilemap': '1.0.0',
      'com.unity.modules.ui': '1.0.0',
      'com.unity.modules.uielements': '1.0.0',
      'com.unity.modules.umbra': '1.0.0',
      'com.unity.modules.unitywebrequest': '1.0.0',
      'com.unity.modules.video': '1.0.0',
    },
    name: projectName,
    version: '0.0.1',
    unity: UNITY_VERSION,
  };
}

function buildSceneContents() {
  return (
    `%YAML 1.1\n` +
    `%TAG !u! tag:unity3d.com,2011:\n` +
    `--- !u!29 &1\n` +
    `OcclusionCullingSettings:\n` +
    `  m_ObjectHideFlags: 0\n` +
    `  serializedVersion: 2\n` +
    `  m_OcclusionBakeSettings:\n` +
    `    smallestOccluder: 5\n` +
    `    smallestHole: 0.25\n` +
    `    backfaceThreshold: 100\n` +
    `  m_SceneGUID: 00000000000000000000000000000000\n` +
    `  m_OcclusionCullingData: {fileID: 0}\n` +
    `--- !u!104 &2\n` +
    `RenderSettings:\n` +
    `  m_ObjectHideFlags: 0\n` +
    `  serializedVersion: 9\n` +
    `  m_Fog: 0\n` +
    `  m_FogColor: {r: 0.5, g: 0.5, b: 0.5, a: 1}\n` +
    `  m_FogMode: 3\n` +
    `  m_FogDensity: 0.01\n` +
    `  m_LinearFogStart: 0\n` +
    `  m_LinearFogEnd: 300\n` +
    `  m_AmbientSkyColor: {r: 0.212, g: 0.227, b: 0.259, a: 1}\n` +
    `  m_AmbientEquatorColor: {r: 0.114, g: 0.125, b: 0.133, a: 1}\n` +
    `  m_AmbientGroundColor: {r: 0.047, g: 0.043, b: 0.035, a: 1}\n` +
    `  m_AmbientIntensity: 1\n` +
    `  m_AmbientMode: 0\n` +
    `  m_SubtractiveShadowColor: {r: 0.42, g: 0.478, b: 0.627, a: 1}\n` +
    `  m_SkyboxMaterial: {fileID: 10304, guid: 0000000000000000f000000000000000, type: 0}\n` +
    `  m_HaloStrength: 0.5\n` +
    `  m_FlareStrength: 1\n` +
    `  m_FlareFadeSpeed: 3\n` +
    `  m_HaloTexture: {fileID: 0}\n` +
    `  m_SpotCookie: {fileID: 10001, guid: 0000000000000000f000000000000000, type: 0}\n` +
    `  m_DefaultReflectionMode: 0\n` +
    `  m_DefaultReflectionResolution: 128\n` +
    `  m_ReflectionBounces: 1\n` +
    `  m_ReflectionIntensity: 1\n` +
    `  m_CustomReflection: {fileID: 0}\n` +
    `  m_Sun: {fileID: 2002}\n` +
    `  m_IndirectSpecularColor: {r: 0.44657874, g: 0.49641275, b: 0.5748173, a: 1}\n` +
    `  m_UseRadianceAmbientProbe: 0\n` +
    `--- !u!157 &3\n` +
    `LightmapSettings:\n` +
    `  m_ObjectHideFlags: 0\n` +
    `  serializedVersion: 12\n` +
    `  m_GIWorkflowMode: 1\n` +
    `  m_GISettings:\n` +
    `    serializedVersion: 2\n` +
    `    m_BounceScale: 1\n` +
    `    m_IndirectOutputScale: 1\n` +
    `    m_AlbedoBoost: 1\n` +
    `    m_TemporalCoherenceThreshold: 1\n` +
    `    m_EnvironmentLightingMode: 0\n` +
    `    m_EnableBakedLightmaps: 1\n` +
    `    m_EnableRealtimeLightmaps: 0\n` +
    `  m_LightmapEditorSettings:\n` +
    `    serializedVersion: 12\n` +
    `    m_Resolution: 2\n` +
    `    m_BakeResolution: 40\n` +
    `    m_AtlasSize: 1024\n` +
    `    m_AO: 0\n` +
    `    m_AOMaxDistance: 1\n` +
    `    m_CompAOExponent: 1\n` +
    `    m_CompAOExponentDirect: 0\n` +
    `    m_Padding: 2\n` +
    `    m_LightmapParameters: {fileID: 0}\n` +
    `    m_LightmapsBakeMode: 1\n` +
    `    m_TextureCompression: 1\n` +
    `    m_FinalGather: 0\n` +
    `    m_FinalGatherRayCount: 1024\n` +
    `    m_ReflectionCompression: 2\n` +
    `    m_MixedBakeMode: 2\n` +
    `    m_BakeBackend: 1\n` +
    `    m_PVRSampling: 1\n` +
    `    m_PVRDirectSampleCount: 32\n` +
    `    m_PVRSampleCount: 512\n` +
    `    m_PVRBounces: 2\n` +
    `    m_PVREnvironmentSampleCount: 256\n` +
    `    m_PVREnvironmentReferencePointCount: 2048\n` +
    `    m_PVRFilteringMode: 1\n` +
    `    m_PVRDenoiserTypeDirect: 1\n` +
    `    m_PVRDenoiserTypeIndirect: 1\n` +
    `    m_PVRDenoiserTypeAO: 1\n` +
    `    m_PVRFilterTypeDirect: 0\n` +
    `    m_PVRFilterTypeIndirect: 0\n` +
    `    m_PVRFilterTypeAO: 0\n` +
    `    m_PVREnvironmentMIS: 1\n` +
    `    m_PVRCulling: 1\n` +
    `    m_PVRFilteringGaussRadiusDirect: 1\n` +
    `    m_PVRFilteringGaussRadiusIndirect: 5\n` +
    `    m_PVRFilteringGaussRadiusAO: 2\n` +
    `    m_PVRFilteringAtrousPositionSigmaDirect: 0.5\n` +
    `    m_PVRFilteringAtrousPositionSigmaIndirect: 2\n` +
    `    m_PVRFilteringAtrousPositionSigmaAO: 1\n` +
    `    m_ExportTrainingData: 0\n` +
    `    m_TrainingDataDestination: TrainingData\n` +
    `    m_LightProbeSampleCountMultiplier: 1\n` +
    `  m_LightingDataAsset: {fileID: 0}\n` +
    `  m_LightingSettings: {fileID: 0}\n` +
    `--- !u!196 &4\n` +
    `NavMeshSettings:\n` +
    `  serializedVersion: 2\n` +
    `  m_ObjectHideFlags: 0\n` +
    `  m_BuildSettings:\n` +
    `    serializedVersion: 2\n` +
    `    agentTypeID: 0\n` +
    `    agentRadius: 0.5\n` +
    `    agentHeight: 2\n` +
    `    agentSlope: 45\n` +
    `    agentClimb: 0.4\n` +
    `    ledgeDropHeight: 0\n` +
    `    maxJumpAcrossDistance: 0\n` +
    `    minRegionArea: 2\n` +
    `    manualCellSize: 0\n` +
    `    cellSize: 0.16666667\n` +
    `    manualTileSize: 0\n` +
    `    tileSize: 256\n` +
    `    accuratePlacement: 0\n` +
    `    maxJobWorkers: 0\n` +
    `    preserveTilesOutsideBounds: 0\n` +
    `    debug:\n` +
    `      m_Flags: 0\n` +
    `  m_NavMeshData: {fileID: 0}\n` +
    `--- !u!1 &1000\n` +
import JSZip from "jszip";
import { randomUUID } from "crypto";

const UNITY_VERSION = "2022.3.17f1";
const UNITY_REVISION = "2022.3.17f1 (9fc6c861743b)";
const DEFAULT_PROJECT_NAME = "BlackRoadUnityPrototype";
const DEFAULT_SCENE_NAME = "SampleScene";
const DEFAULT_SUMMARY = "Prototype Unity project generated by the BlackRoad exporter stub.";
const MAX_NAME_LENGTH = 64;
const MAX_FEATURES = 12;

function sanitizeProjectName(raw) {
  const candidate = String(raw ?? "").trim();
  if (!candidate) {
    return DEFAULT_PROJECT_NAME;
  }
  const cleaned = candidate
    .replace(/[^A-Za-z0-9 _-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s+/g, "-");
  if (!cleaned) {
    return DEFAULT_PROJECT_NAME;
  }
  return cleaned.slice(0, MAX_NAME_LENGTH);
}

function sanitizeSceneName(raw) {
  const candidate = String(raw ?? "").trim();
  if (!candidate) {
    return DEFAULT_SCENE_NAME;
  }
  const cleaned = candidate
    .replace(/[^A-Za-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) {
    return DEFAULT_SCENE_NAME;
  }
  return toPascalCase(cleaned).slice(0, MAX_NAME_LENGTH) || DEFAULT_SCENE_NAME;
}

function sanitizeSummary(raw) {
  if (raw === undefined || raw === null) {
    return DEFAULT_SUMMARY;
  }
  const summary = String(raw).trim();
  return summary || DEFAULT_SUMMARY;
}

function sanitizeFeatures(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }
  const cleaned = raw
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, MAX_FEATURES);
  return cleaned;
}

function toPascalCase(value, fallback = "UnityExportedValue") {
  const parts = String(value ?? "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  if (!parts.length) {
    return fallback;
  }
  return parts.join("");
}

function escapeForCSharp(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escapeForYaml(value) {
  return value.replace(/"/g, '\\"');
}

function createGuid() {
  return randomUUID().replace(/-/g, "").toLowerCase();
}

function wrapFolder(folder, prefix, manifest) {
  return {
    file(name, contents) {
      folder.file(name, contents);
      manifest.push(`${prefix}${name}`);
    },
    folder(name) {
      return wrapFolder(folder.folder(name), `${prefix}${name}/`, manifest);
    },
  };
}

function buildReadme({ projectName, summary, sceneName, features, timestamp }) {
  const featureSection = features.length
    ? features.map((line) => `- ${line}`).join("\n")
    : "- Add gameplay beats or systems you want to explore.";
  return `# ${projectName}\n\n` +
    `Generated ${timestamp.toISOString()} via the BlackRoad Unity exporter stub.\n\n` +
    `## Summary\n${summary}\n\n` +
    `## Primary Scene\n- Assets/Scenes/${sceneName}.unity\n\n` +
    `## Suggested Next Steps\n${featureSection}\n\n` +
    `## Usage\n` +
    `1. Unzip the archive.\n` +
    `2. Open the folder in Unity ${UNITY_VERSION}.\n` +
    `3. Load **${sceneName}.unity** to begin iterating.\n` +
    `4. Replace the generated script with production-ready logic once gameplay direction is locked.`;
}

function buildScene({ sceneName, scriptGuid, summary, features }) {
  const escapedSummary = escapeForYaml(summary);
  const featureLines = features.length ? features.map((f) => `        - ${escapeForYaml(f)}`).join("\n") : "        - Define your first mechanic.";
  return `%YAML 1.1\n` +
    `%TAG !u! tag:unity3d.com,2011:\n` +
    `--- !u!1 &1\n` +
    `GameObject:\n` +
    `  m_ObjectHideFlags: 0\n` +
    `  m_CorrespondingSourceObject: {fileID: 0}\n` +
    `  m_PrefabInstance: {fileID: 0}\n` +
    `  m_PrefabAsset: {fileID: 0}\n` +
    `  serializedVersion: 6\n` +
    `  m_Component:\n` +
    `  - component: {fileID: 1001}\n` +
    `  - component: {fileID: 1002}\n` +
    `  - component: {fileID: 1003}\n` +
    `  m_Layer: 0\n` +
    `  m_Name: Main Camera\n` +
    `  m_TagString: MainCamera\n` +
    `  - component: {fileID: 2}\n` +
    `  - component: {fileID: 3}\n` +
    `  m_Layer: 0\n` +
    `  m_Name: ${sceneName}\n` +
    `  m_TagString: Untagged\n` +
    `  m_Icon: {fileID: 0}\n` +
    `  m_NavMeshLayer: 0\n` +
    `  m_StaticEditorFlags: 0\n` +
    `  m_IsActive: 1\n` +
    `--- !u!4 &1001\n` +
    `--- !u!4 &2\n` +
    `Transform:\n` +
    `  m_ObjectHideFlags: 0\n` +
    `  m_CorrespondingSourceObject: {fileID: 0}\n` +
    `  m_PrefabInstance: {fileID: 0}\n` +
    `  m_PrefabAsset: {fileID: 0}\n` +
    `  m_GameObject: {fileID: 1000}\n` +
    `  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}\n` +
    `  m_LocalPosition: {x: 0, y: 1, z: -10}\n` +
    `  m_LocalScale: {x: 1, y: 1, z: 1}\n` +
    `  m_GameObject: {fileID: 1}\n` +
    `  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}\n` +
    `  m_LocalPosition: {x: 0, y: 0, z: 0}\n` +
    `  m_LocalScale: {x: 1, y: 1, z: 1}\n` +
    `  m_ConstrainProportionsScale: 0\n` +
    `  m_Children: []\n` +
    `  m_Father: {fileID: 0}\n` +
    `  m_RootOrder: 0\n` +
    `  m_LocalEulerAnglesHint: {x: 0, y: 0, z: 0}\n` +
    `--- !u!20 &1002\n` +
    `Camera:\n` +
    `  m_ObjectHideFlags: 0\n` +
    `  m_CorrespondingSourceObject: {fileID: 0}\n` +
    `  m_PrefabInstance: {fileID: 0}\n` +
    `  m_PrefabAsset: {fileID: 0}\n` +
    `  m_GameObject: {fileID: 1000}\n` +
    `  m_Enabled: 1\n` +
    `  serializedVersion: 2\n` +
    `  m_ClearFlags: 1\n` +
    `  m_BackGroundColor: {r: 0.19215687, g: 0.3019608, b: 0.4745098, a: 0}\n` +
    `  m_projectionMatrixMode: 1\n` +
    `  m_SensorSize: {x: 36, y: 24}\n` +
    `  m_LensShift: {x: 0, y: 0}\n` +
    `  m_FocalLength: 50\n` +
    `  m_NormalizedViewPortRect:\n` +
    `    serializedVersion: 2\n` +
    `    x: 0\n` +
    `    y: 0\n` +
    `    width: 1\n` +
    `    height: 1\n` +
    `  near clip plane: 0.3\n` +
    `  far clip plane: 1000\n` +
    `  field of view: 60\n` +
    `  orthographic: 0\n` +
    `  orthographic size: 5\n` +
    `  m_Depth: -1\n` +
    `  m_CullingMask:\n` +
    `    serializedVersion: 2\n` +
    `    m_Bits: 4294967295\n` +
    `  m_RenderingPath: -1\n` +
    `  m_TargetTexture: {fileID: 0}\n` +
    `  m_TargetDisplay: 0\n` +
    `  m_TargetEye: 3\n` +
    `  m_HDR: 1\n` +
    `  m_OcclusionCulling: 1\n` +
    `  m_StereoConvergence: 10\n` +
    `  m_StereoSeparation: 0.022\n` +
    `--- !u!81 &1003\n` +
    `AudioListener:\n` +
    `  m_ObjectHideFlags: 0\n` +
    `  m_CorrespondingSourceObject: {fileID: 0}\n` +
    `  m_PrefabInstance: {fileID: 0}\n` +
    `  m_PrefabAsset: {fileID: 0}\n` +
    `  m_GameObject: {fileID: 1000}\n` +
    `  m_Enabled: 1\n` +
    `--- !u!1 &2000\n` +
    `GameObject:\n` +
    `  m_ObjectHideFlags: 0\n` +
    `  m_CorrespondingSourceObject: {fileID: 0}\n` +
    `  m_PrefabInstance: {fileID: 0}\n` +
    `  m_PrefabAsset: {fileID: 0}\n` +
    `  serializedVersion: 6\n` +
    `  m_Component:\n` +
    `  - component: {fileID: 2001}\n` +
    `  - component: {fileID: 2002}\n` +
    `  m_Layer: 0\n` +
    `  m_Name: Directional Light\n` +
    `  m_TagString: Untagged\n` +
    `  m_Icon: {fileID: 0}\n` +
    `  m_NavMeshLayer: 0\n` +
    `  m_StaticEditorFlags: 0\n` +
    `  m_IsActive: 1\n` +
    `--- !u!4 &2001\n` +
    `Transform:\n` +
    `--- !u!114 &3\n` +
    `MonoBehaviour:\n` +
    `  m_ObjectHideFlags: 0\n` +
    `  m_CorrespondingSourceObject: {fileID: 0}\n` +
    `  m_PrefabInstance: {fileID: 0}\n` +
    `  m_PrefabAsset: {fileID: 0}\n` +
    `  m_GameObject: {fileID: 2000}\n` +
    `  m_LocalRotation: {x: 0.4082179, y: -0.2345697, z: 0.1093817, w: 0.8754261}\n` +
    `  m_LocalPosition: {x: 0, y: 3, z: 0}\n` +
    `  m_LocalScale: {x: 1, y: 1, z: 1}\n` +
    `  m_Children: []\n` +
    `  m_Father: {fileID: 0}\n` +
    `  m_RootOrder: 1\n` +
    `  m_LocalEulerAnglesHint: {x: 50, y: -30, z: 0}\n` +
    `--- !u!108 &2002\n` +
    `Light:\n` +
    `  m_ObjectHideFlags: 0\n` +
    `  m_CorrespondingSourceObject: {fileID: 0}\n` +
    `  m_PrefabInstance: {fileID: 0}\n` +
    `  m_PrefabAsset: {fileID: 0}\n` +
    `  m_GameObject: {fileID: 2000}\n` +
    `  m_Enabled: 1\n` +
    `  serializedVersion: 10\n` +
    `  m_Type: 1\n` +
    `  m_Shape: 0\n` +
    `  m_Color: {r: 1, g: 0.95686275, b: 0.8392157, a: 1}\n` +
    `  m_Intensity: 1\n` +
    `  m_Range: 10\n` +
    `  m_SpotAngle: 30\n` +
    `  m_InnerSpotAngle: 21.802082\n` +
    `  m_CookieSize: 10\n` +
    `  m_Shadows:\n` +
    `    m_Type: 2\n` +
    `    m_Resolution: -1\n` +
    `    m_CustomResolution: -1\n` +
    `    m_Strength: 1\n` +
    `    m_Bias: 0.05\n` +
    `    m_NormalBias: 0.4\n` +
    `    m_NearPlane: 0.2\n` +
    `  m_Cookie: {fileID: 0}\n` +
    `  m_DrawHalo: 0\n` +
    `  m_Flare: {fileID: 0}\n` +
    `  m_RenderMode: 0\n` +
    `  m_CullingMask:\n` +
    `    serializedVersion: 2\n` +
    `    m_Bits: 4294967295\n` +
    `  m_RenderingLayerMask: 1\n` +
    `  m_Lightmapping: 4\n` +
    `  m_LightShadowCasterMode: 0\n` +
    `  m_AreaSize: {x: 1, y: 1}\n` +
    `  m_BounceIntensity: 1\n` +
    `  m_ColorTemperature: 6570\n` +
    `  m_UseColorTemperature: 0\n` +
    `  m_BoundingSphereOverride: {x: 0, y: 0, z: 0, w: 0}\n` +
    `  m_UseBoundingSphereOverride: 0\n` +
    `  m_ShadowRadius: 0\n` +
    `  m_ShadowAngle: 0\n`
  );
}

function buildDefaultMeta(guid) {
  return (
    `fileFormatVersion: 2\n` +
    `  m_GameObject: {fileID: 1}\n` +
    `  m_Enabled: 1\n` +
    `  m_EditorHideFlags: 0\n` +
    `  m_Script: {fileID: 11500000, guid: ${scriptGuid}, type: 3}\n` +
    `  m_Name: ${sceneName} Director\n` +
    `  m_EditorClassIdentifier: \n` +
    `  summary: "${escapedSummary}"\n` +
    `  features:\n${featureLines}\n` +
    `  lastUpdated: "${new Date().toISOString()}"\n` +
    `  readyForPlaytest: 0`;
}

function buildSceneMeta(guid) {
  return `fileFormatVersion: 2\n` +
    `guid: ${guid}\n` +
    `DefaultImporter:\n` +
    `  externalObjects: {}\n` +
    `  userData: \n` +
    `  assetBundleName: \n` +
    `  assetBundleVariant: \n`
  );
}

function buildScriptMeta(guid) {
  return (
    `fileFormatVersion: 2\n` +
    `  assetBundleVariant: `;
}

function buildScript({ namespaceName, className, summary, features, sceneName }) {
  const featureLines = features.length
    ? features.map((line) => `            \"${escapeForCSharp(line)}\"`).join(",\n")
    : "            \"Define your first mechanic\"";
  return `using System.Collections.Generic;\nusing UnityEngine;\n\nnamespace ${namespaceName}\n{\n    public class ${className} : MonoBehaviour\n    {\n        [TextArea(2, 6)]\n        public string Summary = \"${escapeForCSharp(summary)}\";\n\n        [SerializeField]\n        private string[] plannedBeats = new string[]\n        {\n${featureLines}\n        };\n\n        public IReadOnlyList<string> PlannedBeats => plannedBeats;\n\n        private void Start()\n        {\n            Debug.Log($"[${className}] Bootstrapped scene '${escapeForCSharp(sceneName)}'.");\n        }\n\n        public void LogPlan()\n        {\n            foreach (var beat in plannedBeats)\n            {\n                Debug.Log($"[${className}] TODO: {beat}");\n            }\n        }\n    }\n}`;
}

function buildScriptMeta(guid) {
  return `fileFormatVersion: 2\n` +
    `guid: ${guid}\n` +
    `MonoImporter:\n` +
    `  externalObjects: {}\n` +
    `  serializedVersion: 2\n` +
    `  defaultReferences: []\n` +
    `  executionOrder: 0\n` +
    `  icon: {instanceID: 0}\n` +
    `  userData: \n` +
    `  assetBundleName: \n` +
    `  assetBundleVariant: \n`
  );
}

function generateGuid() {
  return randomUUID().replace(/-/g, '').toLowerCase();
    `  assetBundleVariant: `;
}

function buildManifestJson() {
  return JSON.stringify(
    {
      dependencies: {
        "com.unity.cinemachine": "2.8.9",
        "com.unity.inputsystem": "1.6.3",
        "com.unity.textmeshpro": "3.0.6",
        "com.unity.timeline": "1.7.6",
        "com.unity.test-framework": "1.4.5",
      },
    },
    null,
    2,
  );
}

function buildProjectSettings(projectName) {
  return `%YAML 1.1\n` +
    `%TAG !u! tag:unity3d.com,2011:\n` +
    `--- !u!129 &1\n` +
    `PlayerSettings:\n` +
    `  m_ObjectHideFlags: 0\n` +
    `  serializedVersion: 23\n` +
    `  productName: ${projectName}\n` +
    `  companyName: BlackRoad\n` +
    `  bundleVersion: 0.1.0\n` +
    `  defaultScreenWidth: 1920\n` +
    `  defaultScreenHeight: 1080\n` +
    `  runInBackground: 1\n` +
    `  allowFullscreenSwitch: 1\n` +
    `  splashScreenLogos: []\n` +
    `  m_StereoRenderingPath: 0\n` +
    `  m_ActiveColorSpace: 0\n` +
    `  defaultIsNativeResolution: 1`;
}

function buildEditorBuildSettings({ sceneName, sceneGuid }) {
  return `%YAML 1.1\n` +
    `%TAG !u! tag:unity3d.com,2011:\n` +
    `--- !u!1045 &1\n` +
    `EditorBuildSettings:\n` +
    `  m_ObjectHideFlags: 0\n` +
    `  serializedVersion: 2\n` +
    `  m_Scenes:\n` +
    `  - enabled: 1\n` +
    `    path: Assets/Scenes/${sceneName}.unity\n` +
    `    guid: ${sceneGuid}\n` +
    `  m_configObjects: {}`;
}

function buildProjectVersion() {
  return `m_EditorVersion: ${UNITY_VERSION}\n` +
    `m_EditorVersionWithRevision: ${UNITY_REVISION}`;
}

export async function createUnityProjectArchive(options = {}) {
  const projectName = sanitizeProjectName(options.projectName);
  const sceneName = sanitizeSceneName(options.sceneName);
  const summary = sanitizeSummary(options.summary);
  const features = sanitizeFeatures(options.features);
  const namespaceName = `${toPascalCase(projectName, "BlackRoad")}.Generated`;
  const className = `${sceneName}Director`;
  const scriptGuid = createGuid();
  const sceneGuid = createGuid();
  const timestamp = new Date();

  const zip = new JSZip();
  const manifest = [];
  const root = wrapFolder(zip.folder(projectName), `${projectName}/`, manifest);

  root.file("README.md", buildReadme({ projectName, summary, sceneName, features, timestamp }));

  const projectSettings = root.folder("ProjectSettings");
  projectSettings.file("ProjectSettings.asset", buildProjectSettings(projectName));
  projectSettings.file("EditorBuildSettings.asset", buildEditorBuildSettings({ sceneName, sceneGuid }));
  projectSettings.file("ProjectVersion.txt", buildProjectVersion());

  const packages = root.folder("Packages");
  packages.file("manifest.json", buildManifestJson());

  const assets = root.folder("Assets");
  const scenes = assets.folder("Scenes");
  scenes.file(`${sceneName}.unity`, buildScene({ sceneName, scriptGuid, summary, features }));
  scenes.file(`${sceneName}.unity.meta`, buildSceneMeta(sceneGuid));

  const scripts = assets.folder("Scripts");
  scripts.file(`${className}.cs`, buildScript({ namespaceName, className, summary, features, sceneName }));
  scripts.file(`${className}.cs.meta`, buildScriptMeta(scriptGuid));

  const metadata = {
    projectName,
    sceneName,
    scriptClass: className,
    unityVersion: UNITY_VERSION,
    generatedAt: timestamp.toISOString(),
    featureCount: features.length,
  };

  const archiveBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  return {
    buffer: archiveBuffer,
    zipName: `${projectName}-${timestamp.toISOString().replace(/[:.]/g, "-")}.zip`,
    fileManifest: manifest.sort(),
    metadata,
  };
}
