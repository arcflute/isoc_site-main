import { spawn } from 'node:child_process';
const child = spawn(process.execPath, ['node_modules/astro/bin/astro.mjs', 'dev', '--host', '127.0.0.1', '--port', '4322'], { stdio: 'inherit', env: { ...process.env, ISOC_PREVIEW: '1' } });
child.on('exit', code => process.exit(code ?? 0));
