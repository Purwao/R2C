const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
  setMouseThrough: (value) => ipcRenderer.send('set-ignore-mouse-events', value),
  getImages: () => {
    const imgFolder = path.join(__dirname, 'storage/photos');
    if (fs.existsSync(imgFolder)) {
      return fs.readdirSync(imgFolder).map(file => `storage/photos/${file}`); 
    } else {
      console.warn("Image folder does not exist.");
      return [];
    }
  },
  minimize: () => ipcRenderer.send('minimize-window'),
  close: () => ipcRenderer.send('close-window'),
  saveFiles: (files) => ipcRenderer.invoke('save-files', files),
  submitCharacterData: (data) => ipcRenderer.invoke('submit-character-data', data),
  onCharacterData: (callback) => ipcRenderer.on('character-data', (event, data) => callback(data))
});


