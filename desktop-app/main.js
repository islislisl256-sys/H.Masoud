const { app, BrowserWindow, Menu, session } = require('electron');
const path = require('path');

const APP_URL = "https://h-masoud.vercel.app/?electron=true";

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Disable CORS restrictions inside the app just in case
    },
    icon: path.join(__dirname, 'build', 'icon.png')
  });

  Menu.setApplicationMenu(null);
  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    // This makes sure Electron prompts the user for where to save the file!
    item.setSaveDialogOptions({
      title: 'حفظ الفاتورة / الملف',
      defaultPath: item.getFilename(),
      buttonLabel: 'حفظ'
    });
  });


    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      require('electron').shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Clear cache before loading to ensure latest Vercel build is fetched
  mainWindow.webContents.session.clearCache().then(() => {
    mainWindow.loadURL(APP_URL, { extraHeaders: 'pragma: no-cache\n' });
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.key.toLowerCase() === 'r') {
      mainWindow.reload();
      event.preventDefault();
    }
    if (input.control && input.shift && input.key.toLowerCase() === 'r') {
      mainWindow.webContents.session.clearCache().then(() => mainWindow.reload());
      event.preventDefault();
    }
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Ignore certificate errors
app.commandLine.appendSwitch('ignore-certificate-errors');

app.on('ready', () => {
  session.defaultSession.clearCache().then(() => {
    createWindow();
  });
});

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

