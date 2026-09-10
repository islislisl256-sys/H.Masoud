const { app, BrowserWindow } = require('electron');
const path = require('path');
let serve = require('electron-serve');
if (typeof serve !== 'function' && serve && serve.default) {
  serve = serve.default;
}

const loadURL = serve({ directory: path.join(__dirname, 'out') });

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'build', 'icon.png'),
    autoHideMenuBar: true,
  });

  // Load the admin page specifically for the control panel program
  loadURL(mainWindow).then(() => {
    mainWindow.loadURL('app://-/admin.html');
  }).catch(() => {
    mainWindow.loadURL('app://-/admin');
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
