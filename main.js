const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let displayWindow;

ipcMain.on('resize-window', (event, { width, height }) => {
  if (displayWindow) {
    displayWindow.setContentSize(width, height);
    displayWindow.center(); // recenters the window after resize
    displayWindow.show(); // make sure to show after size is set
  }
});

ipcMain.on('minimize-window', () => {
  displayWindow.minimize();
});

ipcMain.on('close-window', () => {
  displayWindow.close();
});

function createDisplayWindow() {
  // const { width, height } = screen.getPrimaryDisplay().bounds;

  displayWindow = new BrowserWindow({
    width:404,
    height:294,
    center: true,
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    hasShadow: false,
    show: false,
    skipTaskbar: false,
    icon: path.join(__dirname, '/storage/assets/windowsicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // still chill unless you want extra security
    },
  });
  

  displayWindow.loadFile('display.html')
  
  displayWindow.webContents.openDevTools({ mode: 'detach' });
  
  displayWindow.show();
  
}

function createMainWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 600,
    height: 150,
    x: width - 620,
    y: 20,
    icon: path.join(__dirname, '/storage/assets/windowsicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    hasShadow: false,
  });

  mainWindow.loadFile('index.html').then(() => {
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  });

  mainWindow.webContents.openDevTools({ mode: 'detach' });
}

app.on('ready', () => {
  createDisplayWindow();
});

// Handle interaction from displayWindow
ipcMain.on('display-form-submitted', (event, formData) => {
  console.log('Form submitted:', formData); // you can use formData if needed
  if (displayWindow) {
    displayWindow.close();
  }
  createMainWindow();
});

ipcMain.on('set-ignore-mouse-events', (event, ignore) => {
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createDisplayWindow();
  }
});
