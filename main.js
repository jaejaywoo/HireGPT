const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1300,
    height: 1000,
    titleBarStyle: 'hidden',
    trafficLightPosition: {
      x: 15,
      y: 13,  // macOS traffic lights seem to be 14px in diameter. If you want them vertically centered, set this to `titlebar_height / 2 - 7`.
  },
  });

  win.loadFile('index.html');
  // win.webContents.openDevTools()  // Debugger
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

var pyProc = null;

const createPyProc = () => {
  let script = path.join(__dirname, 'pydist', 'app');
  pyProc = require('child_process').execFile(script);

  if (pyProc != null) {
    var logStream = fs.createWriteStream('/tmp/logFile.log', {flags: 'a'});

    fs.writeFile(
      '/tmp/logFile.log',
      `Python process spawned. (pid: ${pyProc.pid})`,
      { flag: 'a' },
      err => {}
    );

    pyProc.stdout.pipe(logStream);
    pyProc.stderr.pipe(logStream);

  } else {
    fs.writeFile(
      '/tmp/logFile.log',
      'Python process failed to spawn.',
      { flag: 'a' },
      err => {}
    );
  }
}

const exitPyProc = () => {
  pyProc.kill();
  pyProc = null;
  console.log('Python process killed.');
}

app.on('ready', createPyProc);
app.on('will-quit', exitPyProc);