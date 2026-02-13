// project.ts — project root detection
import fs from 'fs-extra';
import path from 'path';

export async function findProjectRoot(startDir: string = process.cwd()): Promise<string> {
  let current = startDir;
  const root = path.parse(startDir).root;

  while (current !== root) {
    if (await fs.pathExists(path.join(current, '.faiddrc.json'))) {
      return current;
    }
    if (await fs.pathExists(path.join(current, 'package.json'))) {
      return current;
    }
    if (await fs.pathExists(path.join(current, '.git'))) {
      return current;
    }
    current = path.dirname(current);
  }

  return startDir; // fallback to cwd
}
