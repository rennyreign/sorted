const { app, BrowserWindow, shell, dialog } = require("electron");
const { spawn, exec } = require("child_process");
const path = require("node:path");
const fs = require("node:fs/promises");
const net = require("node:net");
const http = require("node:http");

let mainWindow = null;
let serverProcess = null;
let serverPort = null;

const dbPath = path.join(app.getPath("userData"), "sortedinvoice.db");

async function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

function findNode() {
  return new Promise((resolve) => {
    const shell = process.platform === "darwin" ? "/bin/zsh" : "/bin/bash";
    exec(`${shell} -l -c "which node"`, { timeout: 5000 }, (err, stdout) => {
      if (err) {
        resolve("node");
        return;
      }
      const found = stdout.trim().split("\n").pop().trim();
      resolve(found || "node");
    });
  });
}

async function getNode() {
  const bundled = path.join(getAppRoot(), "bin", "node");
  try {
    await fs.access(bundled, fs.constants.X_OK);
    return bundled;
  } catch {
    return findNode();
  }
}

function getAppRoot() {
  return path.join(__dirname, "..");
}

async function startServer(port) {
  const node = await getNode();
  const appRoot = getAppRoot();
  const nextBin = path.join(appRoot, "node_modules", "next", "dist", "bin", "next");

  const env = {
    ...process.env,
    SORTEDINVOICE_DB: dbPath,
    NODE_ENV: "production",
  };

  console.log(`Starting Next.js server on port ${port} using Node at ${node}`);
  console.log(`Database: ${dbPath}`);

  serverProcess = spawn(node, [nextBin, "start", "-p", String(port)], {
    cwd: appRoot,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  serverProcess.stdout.on("data", (data) => {
    console.log(`[next] ${data}`.trimEnd());
  });

  serverProcess.stderr.on("data", (data) => {
    console.error(`[next] ${data}`.trimEnd());
  });

  serverProcess.on("exit", (code) => {
    console.log(`Next.js server exited with code ${code}`);
  });

  return new Promise((resolve, reject) => {
    serverProcess.on("error", reject);
    // Give it a moment to start before resolving; health check will catch real failures.
    serverProcess.on("spawn", resolve);
    setTimeout(resolve, 100);
  });
}

function waitForServer(port) {
  const url = `http://localhost:${port}`;
  const timeout = 30000;
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http
        .request(url, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve();
          } else {
            setTimeout(check, 250);
          }
        })
        .on("error", () => {
          if (Date.now() - start > timeout) {
            reject(new Error(`Timed out waiting for Next.js server at ${url}`));
          } else {
            setTimeout(check, 250);
          }
        });
      req.end();
    };
    check();
  });
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "SortedInvoice",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  mainWindow.loadURL(`http://localhost:${port}`);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    serverPort = await findFreePort();
    await startServer(serverPort);
    await waitForServer(serverPort);
    createWindow(serverPort);
  } catch (err) {
    console.error("Failed to start SortedInvoice:", err);
    dialog.showErrorBox("SortedInvoice failed to start", err.message);
    app.quit();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && serverPort) {
      createWindow(serverPort);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
