/**
 * roadbridge — Google Drive API client
 *
 * Uses Workload Identity Federation for authentication — no static
 * Service Account JSON keys. Short-lived tokens are fetched on-demand
 * and never persisted to disk.
 *
 * Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
 */

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

/**
 * Upload a file to Google Drive.
 * @param {string} accessToken - Short-lived OAuth2 token
 * @param {object} params
 * @param {string} params.name - File name
 * @param {string} params.folderId - Parent folder ID
 * @param {string|ReadableStream|ArrayBuffer} params.content - File content
 * @param {string} params.mimeType - MIME type of the content
 * @param {string} [params.driveMimeType] - Google Drive MIME type (e.g. for Doc conversion)
 * @returns {Promise<{id: string, name: string, webViewLink: string}>}
 */
export async function uploadFile(accessToken, params) {
  const metadata = {
    name: params.name,
    parents: [params.folderId],
  };
  if (params.driveMimeType) {
    metadata.mimeType = params.driveMimeType;
  }

  // Use multipart upload for files under 5MB, resumable for larger
  const content =
    typeof params.content === 'string'
      ? new TextEncoder().encode(params.content)
      : params.content;

  const boundary = '---roadbridge-boundary-' + Date.now();
  const metadataStr = JSON.stringify(metadata);

  const bodyParts = [
    `--${boundary}\r\n`,
    'Content-Type: application/json; charset=UTF-8\r\n\r\n',
    metadataStr,
    `\r\n--${boundary}\r\n`,
    `Content-Type: ${params.mimeType}\r\n\r\n`,
  ];

  // Build the multipart body
  const encoder = new TextEncoder();
  const preamble = encoder.encode(bodyParts.join(''));
  const postamble = encoder.encode(`\r\n--${boundary}--`);

  let contentBytes;
  if (content instanceof ArrayBuffer) {
    contentBytes = new Uint8Array(content);
  } else if (content instanceof Uint8Array) {
    contentBytes = content;
  } else {
    // ReadableStream — collect into bytes
    const reader = content.getReader();
    const chunks = [];
    let done = false;
    while (!done) {
      const result = await reader.read();
      done = result.done;
      if (result.value) chunks.push(result.value);
    }
    const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
    contentBytes = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      contentBytes.set(chunk, offset);
      offset += chunk.length;
    }
  }

  const body = new Uint8Array(
    preamble.length + contentBytes.length + postamble.length,
  );
  body.set(preamble, 0);
  body.set(contentBytes, preamble.length);
  body.set(postamble, preamble.length + contentBytes.length);

  const res = await fetch(`${UPLOAD_API}/files?uploadType=multipart&fields=id,name,webViewLink`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: body,
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Drive upload failed: ${res.status} ${errBody}`);
  }

  return res.json();
}

/**
 * Create a folder in Google Drive (if it doesn't already exist).
 * @param {string} accessToken
 * @param {string} name - Folder name
 * @param {string} parentId - Parent folder ID
 * @returns {Promise<{id: string, name: string}>}
 */
export async function ensureFolder(accessToken, name, parentId) {
  // Check if folder already exists
  const query = `name='${escapeDriveQuery(name)}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const searchRes = await fetch(
    `${DRIVE_API}/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return { id: data.files[0].id, name: data.files[0].name };
    }
  }

  // Create the folder
  const res = await fetch(`${DRIVE_API}/files?fields=id,name`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      parents: [parentId],
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Drive folder creation failed: ${res.status} ${errBody}`);
  }

  return res.json();
}

/**
 * Ensure a nested folder path exists, creating intermediate folders as needed.
 * @param {string} accessToken
 * @param {string} rootFolderId - Root Drive folder ID
 * @param {string} path - Path like "releases/my-repo/v1.0"
 * @returns {Promise<string>} - The ID of the leaf folder
 */
export async function ensureFolderPath(accessToken, rootFolderId, path) {
  const segments = path.split('/').filter(Boolean);
  let currentId = rootFolderId;

  for (const segment of segments) {
    // Skip segments that look like file names (have extensions)
    if (segment.includes('.') && !segment.startsWith('.')) break;
    const folder = await ensureFolder(accessToken, segment, currentId);
    currentId = folder.id;
  }

  return currentId;
}

/**
 * Download a file's content from Google Drive.
 * @param {string} accessToken
 * @param {string} fileId
 * @param {string} [exportMimeType] - For Google Docs, export as this MIME type
 * @returns {Promise<{content: string, mimeType: string}>}
 */
export async function downloadFile(accessToken, fileId, exportMimeType) {
  let url;
  if (exportMimeType) {
    url = `${DRIVE_API}/files/${fileId}/export?mimeType=${encodeURIComponent(exportMimeType)}`;
  } else {
    url = `${DRIVE_API}/files/${fileId}?alt=media`;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Drive download failed: ${res.status} ${errBody}`);
  }

  return {
    content: await res.text(),
    mimeType: res.headers.get('content-type') || 'application/octet-stream',
  };
}

/**
 * Register a Drive push notification channel.
 * Channels expire after 1 hour and must be renewed.
 * @param {string} accessToken
 * @param {string} folderId - Folder to watch
 * @param {string} webhookUrl - URL to receive notifications
 * @param {string} channelToken - Secret token for verification
 * @returns {Promise<{channelId: string, resourceId: string, expiration: number}>}
 */
export async function registerWatchChannel(
  accessToken,
  folderId,
  webhookUrl,
  channelToken,
) {
  const channelId = `roadbridge-${Date.now()}`;

  const res = await fetch(`${DRIVE_API}/files/${folderId}/watch`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: channelId,
      type: 'web_hook',
      address: webhookUrl,
      token: channelToken,
      expiration: Date.now() + 3600000, // 1 hour
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Watch registration failed: ${res.status} ${errBody}`);
  }

  const data = await res.json();
  return {
    channelId: data.id,
    resourceId: data.resourceId,
    expiration: parseInt(data.expiration, 10),
  };
}

/**
 * Stop a Drive push notification channel.
 * @param {string} accessToken
 * @param {string} channelId
 * @param {string} resourceId
 * @returns {Promise<void>}
 */
export async function stopWatchChannel(accessToken, channelId, resourceId) {
  const res = await fetch('https://www.googleapis.com/drive/v3/channels/stop', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: channelId, resourceId }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Channel stop failed: ${res.status} ${errBody}`);
  }
}

/**
 * Get file metadata from Google Drive.
 * @param {string} accessToken
 * @param {string} fileId
 * @returns {Promise<object>}
 */
export async function getFileMetadata(accessToken, fileId) {
  const res = await fetch(
    `${DRIVE_API}/files/${fileId}?fields=id,name,mimeType,parents,modifiedTime,size,webViewLink`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!res.ok) {
    throw new Error(`Drive metadata fetch failed: ${res.status}`);
  }

  return res.json();
}

function escapeDriveQuery(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
