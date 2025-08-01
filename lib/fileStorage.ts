import fs from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';

const UPLOAD_DIR = join(process.cwd(), 'public/uploads');
const UPLOAD_URL = '/uploads';

export async function ensureUploadDirs() {
  const dirs = [
    join(UPLOAD_DIR, 'images'),
    join(UPLOAD_DIR, 'videos'),
    join(UPLOAD_DIR, 'thumbs')
  ];

  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await mkdir(dir, { recursive: true });
    }
  }
}

type FileType = 'image' | 'video';

export async function saveFile(
  file: File,
  type: FileType,
  fileName?: string
): Promise<{ path: string; url: string; name: string }> {
  await ensureUploadDirs();
  
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const name = `${fileName || uuidv4()}.${ext}`;
  const relativePath = `${type}s/${name}`;
  const filePath = join(UPLOAD_DIR, relativePath);
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  await fs.writeFile(filePath, buffer);
  
  return {
    path: filePath,
    url: `${UPLOAD_URL}/${relativePath}`,
    name
  };
}

export async function deleteFile(url: string): Promise<void> {
  try {
    const filePath = url.startsWith('/')
      ? join(process.cwd(), 'public', url)
      : url;
      
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
    // Don't throw to prevent upload failure if delete fails
  }
}

export function getPublicUrl(path: string): string {
  return path.startsWith('http') ? path : `${UPLOAD_URL}/${path}`;
}
