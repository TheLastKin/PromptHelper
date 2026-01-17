import { app, BrowserWindow, clipboard, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import fs from "fs";
import https from "https";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const assetsDir = path.join(app.getPath("userData"), "assets");
const statePath = path.join(app.getPath("userData"), "window_state.json");

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const loadWindowState = () => {
  try {
    return JSON.parse(fs.readFileSync(statePath, "utf-8"));
  } catch {
    return { width: 600, height: 700 };
  }
};

const windowBounds = loadWindowState();
let mainWindow: BrowserWindow;
let lastText = "";
let interval: any;

const isImageURL = (text: string) => {
  try {
    const url = new URL(text.trim());
    return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url.pathname);
  } catch {
    return false;
  }
};

const bringToFront = () => {
  if (!mainWindow) return;

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.focus();
};

const startChecking = () => {
  interval = setInterval(() => {
    const currentText = clipboard.readText();
    if (isImageURL(currentText) && lastText !== currentText) {
      bringToFront();
      mainWindow.webContents.send("onURLReceived", currentText);
      lastText = currentText;
    }
  }, 500);
};

const stopChecking = () => clearInterval(interval);

function getImageNameFromUrl(url: string) {
  const { pathname } = new URL(url);
  return path.basename(pathname);
}

const checkForExistingFile = (filePath: string) => {
  if(fs.existsSync(filePath)){
    fs.unlinkSync(filePath);
  }
};

const saveFromHttps = (e: any, url: string, refID: number) => {
  return new Promise((resolve, reject) => {
    const fileName = refID + path.extname(getImageNameFromUrl(url));
    checkForExistingFile(path.join(assetsDir, fileName));
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const filePath = path.join(assetsDir, fileName);
        const file = fs.createWriteStream(filePath);
        res.pipe(file);

        file.on("finish", () => {
          file.close(() => resolve(file.path));
        });
      })
      .on("error", reject);
  });
};

const saveFromBuffer = (e: any, data: ArrayBuffer, fileName: string, refID: number) => {
  return new Promise((resolve, reject) => {
    try {
      const newFileName = refID + fileName.substring(fileName.lastIndexOf("."));
      console.log(newFileName);
      const filePath = path.join(assetsDir, newFileName);
      checkForExistingFile(filePath);
      fs.writeFile(filePath, Buffer.from(data), () => resolve(filePath));
    } catch (error) {
      reject(error);
    }
  });
};

const removeFile = (e: any, path: string) => {
  try {
    fs.unlink(path, () => {
      console.log("deleted");
    });
  } catch (error) {
    //what?
    console.error(error);
  }
};

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: windowBounds.width,
    height: windowBounds.height,
    minHeight: 700,
    minWidth: 600,
    frame: false,
    icon: path.join("../assets/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  if(!app.isPackaged){
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

let isWindowAlwaysOnTop = false;

const toggleWindowMode = () => {
  if(isWindowAlwaysOnTop){
    isWindowAlwaysOnTop = false
    mainWindow.setAlwaysOnTop(false)
  }else{
    isWindowAlwaysOnTop = true
    mainWindow.setAlwaysOnTop(true)
  }
}

app.whenReady().then(() => {
  ipcMain.on("startChecking", startChecking);
  ipcMain.on("stopChecking", stopChecking);
  ipcMain.on("removeRefImage", removeFile);
  ipcMain.handle("saveFromHTTPS", saveFromHttps);
  ipcMain.handle("saveFromBuffer", saveFromBuffer);
  ipcMain.on("toggleWindowMode", toggleWindowMode)
  let resizeTimeout: any;
  mainWindow.on("resize", () => {
    try {
      clearTimeout(resizeTimeout);
    } catch (error) {
      //what
    }

    resizeTimeout = setTimeout(() => {
      const { width, height } = mainWindow.getBounds();
      fs.writeFileSync(statePath, JSON.stringify({ width, height }));
    }, 200);
  });
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
