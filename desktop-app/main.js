const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// === رابط الموقع الخاص بك ===
// قم بتغيير هذا الرابط إلى رابط الموقع الحقيقي بعد رفعه
const APP_URL = "https://your-domain.com";

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'build', 'icon.png') // If you have an icon
  });

  // Remove default menu
  Menu.setApplicationMenu(null);

  mainWindow.loadURL(APP_URL);

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});