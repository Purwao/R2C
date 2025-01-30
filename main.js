const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
  // Get the current display size (primary screen)
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 600, // Window width
    height: 150, // Window height
    x: width - 620, // Position the window at the right side (400px width + 20px margin)
    y: 20, // Position from the top edge (20px margin)
    icon:path.join(__dirname,'/storage/assets/windowsicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false, // Optional: Remove the default window frame
    alwaysOnTop: true, // Keep the window always on top
    transparent: true, // Make the window transparent
  });

  // Load the HTML file
  mainWindow.loadFile('index.html');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
