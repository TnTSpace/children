import ffprobe from 'ffprobe-static';
import { spawn } from 'node:child_process';

/** Return a media file's duration in seconds (0 if it can't be read). */
export function probeDurationSec(filePath: string): Promise<number> {
  return new Promise((resolve) => {
    try {
      const ff = spawn(ffprobe.path, [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        filePath
      ]);
      let out = '';
      ff.stdout.on('data', (d: Buffer) => (out += d.toString()));
      ff.on('error', () => resolve(0));
      ff.on('close', () => {
        const n = parseFloat(out.trim());
        resolve(Number.isFinite(n) && n > 0 ? n : 0);
      });
    } catch {
      resolve(0);
    }
  });
}
