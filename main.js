const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
const stateFilePath = path.join(app.getPath('userData'), 'window-state.json');

function loadWindowState() {
  const defaultState = {
    width: 950,
    height: 750,
    x: undefined,
    y: undefined,
    isMaximized: false
  };

  try {
    if (fs.existsSync(stateFilePath)) {
      const data = fs.readFileSync(stateFilePath, 'utf8');
      return { ...defaultState, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to load window state:', e);
  }
  return defaultState;
}

function saveWindowState(state) {
  try {
    fs.writeFileSync(stateFilePath, JSON.stringify(state), 'utf8');
  } catch (e) {
    console.error('Failed to save window state:', e);
  }
}

function createWindow() {
  const state = loadWindowState();

  mainWindow = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: 800,
    minHeight: 650,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#0f172a', // Match slate-900 background
  });

  if (state.isMaximized) {
    mainWindow.maximize();
  }

  mainWindow.loadFile('index.html');

  // Hide the menu bar for a sleek desktop app look
  mainWindow.removeMenu();

  function updateState() {
    if (!mainWindow) return;
    
    const isMaximized = mainWindow.isMaximized();
    const isMinimized = mainWindow.isMinimized();
    
    if (!isMaximized && !isMinimized) {
      const bounds = mainWindow.getBounds();
      state.width = bounds.width;
      state.height = bounds.height;
      state.x = bounds.x;
      state.y = bounds.y;
    }
    
    state.isMaximized = isMaximized;
    saveWindowState(state);
  }

  mainWindow.on('resize', updateState);
  mainWindow.on('move', updateState);
  mainWindow.on('maximize', updateState);
  mainWindow.on('unmaximize', updateState);
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
