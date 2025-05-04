const { app, BrowserWindow, ipcMain,screen } = require('electron');
const path = require('path');
const fs= require('fs');

let mainWindow;
let displayWindow;

let characterData = null;

//handling display's submits
ipcMain.handle('submit-character-data', async (event, data) => {
  characterData = data;

  if (!mainWindow) {
    createMainWindow();
  } else {
    mainWindow.webContents.send('character-data', characterData);
    displayWindow.close();
    mainWindow.show();
  }
});

//saving file to a directory
ipcMain.handle('save-files', async (event, filesWithData) => {
  try {
    const destDir = path.join(__dirname, 'storage', 'photos');

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const savedFiles = [];

    for (let i = 0; i < filesWithData.length; i++) {
      const { name, dataUrl } = filesWithData[i];
      const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
      if (!matches) throw new Error("Invalid data URL format");

      const ext = path.extname(name) || '.png';
      const base64Data = matches[2];
      const filename = `${Date.now()}_${i}${ext}`;
      const filePath = path.join(destDir, filename);

      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      savedFiles.push(filePath);
    }

    console.log('Saved images to:', savedFiles);
    return savedFiles;

  } catch (err) {
    console.error('Error saving image files:', err);
    throw err;
  }
});

//set thru click
ipcMain.on('set-ignore-mouse-events', (event, ignore) => {
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
  }
});

//veri veri veri hard logic for minimize
ipcMain.on('minimize-window', () => {
  displayWindow.minimize();
});

//veri veri ez logic for close
ipcMain.on('close-window', () => {
  displayWindow.close();
});

function createDisplayWindow() {
  displayWindow = new BrowserWindow({
    width:500,
    height:800,
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
      sandbox: false, 
    },
  });
  displayWindow.loadFile('display.html')
  
  // displayWindow.webContents.openDevTools({ mode: 'detach' });
  
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
    if (characterData) {
      mainWindow.webContents.send('character-data', characterData);
    }
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  });

  // mainWindow.webContents.openDevTools({ mode: 'detach' });
}

app.on('ready', () => {
  createDisplayWindow();
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
