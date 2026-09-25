import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), 'server/data');

export async function readJson<T>(name: string, fallback: T): Promise<T> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try { return JSON.parse(await fs.readFile(path.join(DATA_DIR, name), 'utf8')) as T; }
  catch { return fallback; }
}

export async function writeJson<T>(name: string, value: T): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const target = path.join(DATA_DIR, name);
  const temp = `${target}.tmp`;
  await fs.writeFile(temp, JSON.stringify(value, null, 2), 'utf8');
  await fs.rename(temp, target);
}
