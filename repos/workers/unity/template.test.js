import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { buildUnityTemplate, sanitizeName, UNITY_VERSION } from './template.js';

describe('sanitizeName', () => {
  it('trims whitespace and collapses invalid characters', () => {
    const cleaned = sanitizeName('  My Project!@#  ', 'Fallback');
    assert.equal(cleaned, 'My-Project');
  });

  it('falls back when the value is missing or empty', () => {
    assert.equal(sanitizeName(undefined, 'Default'), 'Default');
    assert.equal(sanitizeName('!!!', 'Default'), 'Default');
  });
});

describe('buildUnityTemplate', () => {
  it('generates a manifest and scene files that match the request', () => {
    const projectName = 'SampleProject';
    const sceneName = 'PrototypeScene';

    const template = buildUnityTemplate({ projectName, sceneName });
    assert.ok(template.files instanceof Map);

    const manifestRaw = template.files.get('Packages/manifest.json');
    assert.ok(manifestRaw, 'manifest file missing');
    const manifest = JSON.parse(manifestRaw);
    assert.equal(manifest.name, projectName);
    assert.equal(manifest.unity, UNITY_VERSION);

    const projectSettings = template.files.get(
      'ProjectSettings/ProjectSettings.asset'
    );
    assert.ok(projectSettings?.includes(`productName: ${projectName}`));

    const sceneFile = template.files.get(`Assets/Scenes/${sceneName}.unity`);
    assert.ok(sceneFile?.includes(`m_Name: Main Camera`));

    const sceneMeta = template.files.get(
      `Assets/Scenes/${sceneName}.unity.meta`
    );
    assert.ok(sceneMeta?.includes(`guid: ${template.instructions.sceneGuid}`));

    const scriptMeta = template.files.get(
      'Assets/Scripts/HelloBlackRoad.cs.meta'
    );
    assert.ok(
      scriptMeta?.includes(`guid: ${template.instructions.scriptGuid}`)
    );

    assert.ok(/^[0-9a-f]{32}$/i.test(template.instructions.sceneGuid));
    assert.ok(/^[0-9a-f]{32}$/i.test(template.instructions.scriptGuid));
  });

  it('describes the generated assets in the instructions payload', () => {
    const projectName = 'AgentSim';
    const sceneName = 'Prototype';
    const template = buildUnityTemplate({ projectName, sceneName });

    assert.deepEqual(template.instructions, {
      projectName,
      sceneName,
      sceneGuid: template.instructions.sceneGuid,
      scriptGuid: template.instructions.scriptGuid,
    });

    const readme = template.files.get('README.md');
    assert.ok(readme?.includes(`# ${projectName}`));
    assert.ok(readme?.includes(`Assets/Scenes/${sceneName}.unity`));
  });
});
