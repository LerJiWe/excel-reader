import { app, BrowserWindow } from 'electron';
import url from 'url';
import path from 'path';

let mainWinow: BrowserWindow | null;

function createWindow() {
  mainWinow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWinow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/electron-app/index.html`),
      protocol: "file:",
      slashes: true
    })
  );

  // Open the DevTools.
  mainWinow.webContents.openDevTools();

  mainWinow.on('close', function () {
    mainWinow = null
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWinow === null) createWindow();
});
