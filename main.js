const { app, BrowserWindow } = require('electron');
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

  // See more details at:
  // https://medium.com/red-buffer/integrating-python-flask-backend-with-electron-nodejs-frontend-8ac621d13f72
  // var python = require('child_process').spawn('py', ['./backend/app.py']);
  // python.stdout.on('data', function (data) {
  //   console.log("data: ", data.toString('utf8'));
  // });
  // python.stderr.on('data', (data) => {
  //   console.error(`stderr: ${data}`); // when error
  // });
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
  let script = path.join(__dirname, 'backend', 'app.py');
  pyProc = require('child_process').spawn('python', [script], { stdio: 'pipe' });

  if (pyProc != null) {
    console.log(`Python process spawned. (pid: ${pyProc.pid})`);

    pyProc.stdout.on('data', (data) => {
      console.log('[Backend STDOUT] ' + data.toString('utf8'));
    });
    pyProc.stderr.on('data', (data) => {
      console.log('[Backend STDERR] ' + data.toString('utf8'));
    });
  }
}

const exitPyProc = () => {
  pyProc.kill();
  pyProc = null;
  console.log('Python process killed.');
}

app.on('ready', createPyProc);
app.on('will-quit', exitPyProc);