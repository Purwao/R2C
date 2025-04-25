const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
  setMouseThrough: (value) => ipcRenderer.send('set-ignore-mouse-events', value),
  getImages: () => {
    const imgFolder = path.join(__dirname, 'storage/photos');
    if (fs.existsSync(imgFolder)) {
      return fs.readdirSync(imgFolder).map(file => `storage/photos/${file}`); // ← add a slash here
    } else {
      console.warn("Image folder does not exist.");
      return [];
    }
  },
  resizeWindow: (width, height) => ipcRenderer.send('resize-window', { width, height }),
  minimize: () => ipcRenderer.send('minimize-window'),
  close: () => ipcRenderer.send('close-window'),
});


