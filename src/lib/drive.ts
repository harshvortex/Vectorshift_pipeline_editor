import { DriveFile } from '../types';

/**
 * Extracts folder ID from a Google Drive folder link.
 */
export function extractFolderId(urlOrId: string): string {
  const trimmed = urlOrId.trim();
  if (!trimmed) return '';
  
  // Match standard drive folder link format
  // e.g., https://drive.google.com/drive/folders/1ENWF8SIfbMw_wA5VxSoLMGacffndOOzJ
  // or https://drive.google.com/drive/u/0/folders/1ENWF8SIfbMw_wA5VxSoLMGacffndOOzJ
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  
  return trimmed;
}

/**
 * Lists all files inside a folder (and optionally traverses subfolders)
 */
export async function listFolderFiles(
  folderId: string,
  accessToken: string,
  maxLevels = 3,
  currentLevel = 1,
  currentPath = ''
): Promise<DriveFile[]> {
  const files: DriveFile[] = [];
  try {
    const q = `'${folderId}' in parents and trashed = false`;
    const fields = 'files(id, name, mimeType, size)';
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&pageSize=100`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Google Drive API error: ${res.statusText}`);
    }

    const data = await res.json();
    const items = data.files || [];

    for (const item of items) {
      const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
      const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;

      const fileObj: DriveFile = {
        id: item.id,
        name: item.name,
        mimeType: item.mimeType,
        parentId: folderId,
        size: item.size,
        path: itemPath,
      };

      files.push(fileObj);

      // Recursive step for folders
      if (isFolder && currentLevel < maxLevels) {
        const subFiles = await listFolderFiles(
          item.id,
          accessToken,
          maxLevels,
          currentLevel + 1,
          itemPath
        );
        files.push(...subFiles);
      }
    }
  } catch (error) {
    console.error(`Error listing folder ${folderId}:`, error);
    throw error;
  }
  return files;
}

/**
 * Fetches content of a text-based Google Drive file.
 */
export async function fetchFileContent(fileId: string, accessToken: string): Promise<string> {
  try {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      if (res.status === 403) {
        // Fallback or retry for GDoc/GSheets which need export format
        throw new Error('This file format cannot be fetched directly (it may be a Google Doc/Sheet that requires exporting). Please select text or code files (e.g. .ts, .js, .json, .md, .py, .java).');
      }
      throw new Error(`Failed to fetch file content: ${res.statusText}`);
    }

    const text = await res.text();
    return text;
  } catch (error: any) {
    console.error(`Error fetching file content for ${fileId}:`, error);
    throw error;
  }
}
