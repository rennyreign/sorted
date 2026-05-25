#!/usr/bin/env node
/**
 * Reliable dev server wrapper
 * Handles cleanup, port conflicts, and provides clear status
 */

const { spawn } = require('child_process');

const PROJECT_DIR = process.cwd();
const PORT = 3000;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function killPortProcesses() {
  log('Cleaning up port ' + PORT + '...', 'yellow');
  
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  
  try {
    const { stdout } = await execPromise(`lsof -ti:${PORT}`);
    if (stdout) {
      const pids = stdout.trim().split('\n');
      for (const pid of pids) {
        try {
          process.kill(parseInt(pid), 'SIGKILL');
          log(`Killed process ${pid}`, 'green');
        } catch (e) {}
      }
    }
  } catch (e) {}
  
  await new Promise(r => setTimeout(r, 1000));
}

async function startServer() {
  await killPortProcesses();
  
  log('');
  log('Starting Next.js dev server...', 'cyan');
  log(`URL: http://localhost:${PORT}`, 'blue');
  log(`CMS: http://localhost:${PORT}/cms/`, 'blue');
  log('');
  log('Press Ctrl+C to stop', 'yellow');
  log('');
  
  const child = spawn('npm', ['run', 'dev'], {
    cwd: PROJECT_DIR,
    stdio: 'inherit',
    detached: false
  });
  
  process.on('SIGINT', () => {
    log('Shutting down...', 'yellow');
    child.kill('SIGTERM');
    process.exit(0);
  });
  
  return child;
}

(async () => {
  await startServer();
})();
