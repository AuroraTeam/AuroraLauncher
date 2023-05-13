import { join } from 'path';

import { window as windowConfig } from '@config';
import { BrowserWindow, app, ipcMain } from 'electron';
import installExtension, {
    REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';

import { WINDOW_CLOSE_EVENT, WINDOW_HIDE_EVENT } from '../../common/channels';
import logo from '../../renderer/runtime/assets/images/logo.png';

const isDev = process.env.DEV === 'true';

export class LauncherWindow {
    private mainWindow?: BrowserWindow;

    /**
     * Launcher initialization
     */
    constructor() {
        // This method will be called when Electron has finished
        // initialization and is ready to create browser windows.
        // Some APIs can only be used after this event occurs.
        app.whenReady().then(() => {
            this.mainWindow = this.createMainWindow();
            if (isDev) {
                installExtension(REACT_DEVELOPER_TOOLS, {
                    loadExtensionOptions: { allowFileAccess: true },
                })
                    .then((name: any) =>
                        console.log(`Added Extension: ${name}`)
                    )
                    .catch((err: any) =>
                        console.error('An error occurred: ', err)
                    );
            }

            app.on('activate', () => {
                // On macOS it's common to re-create a window in the app when the
                // dock icon is clicked and there are no other windows open.
                if (!this.mainWindow) this.mainWindow = this.createMainWindow();
            });
        });

        // Quit when all windows are closed, except on macOS. There, it's common
        // for applications and their menu bar to stay active until the user quits
        // explicitly with Cmd + Q.
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') app.quit();
        });

        // hide the main window when the minimize button is pressed
        ipcMain.on(WINDOW_HIDE_EVENT, () => {
            this.mainWindow?.minimize();
        });

        // close the main window when the close button is pressed
        ipcMain.on(WINDOW_CLOSE_EVENT, () => {
            this.mainWindow?.close();
        });
    }

    /**
     * Create launcher window
     */
    private createMainWindow(): BrowserWindow {
        // creating and configuring a window
        const mainWindow = new BrowserWindow({
            show: false, // Use 'ready-to-show' event to show window
            width: windowConfig.width || 900,
            height: windowConfig.height || 550,
            frame: windowConfig.frame || false,
            resizable: windowConfig.resizable || false,
            maximizable: windowConfig.maximizable || false,
            fullscreenable: windowConfig.fullscreenable || false,
            title: windowConfig.title || 'Aurora Launcher',
            icon: join(__dirname, logo), // TODO Check no img (maybe use mainWindow.setIcon())
            webPreferences: {
                preload: join(__dirname, '../preload/index.js'),
                devTools: isDev,
            },
        });

        // loading renderer code (runtime)
        if (isDev) mainWindow.loadURL('http://localhost:3000');
        else mainWindow.loadFile(join(__dirname, '../renderer/index.html'));

        mainWindow.on('closed', () => {
            this.mainWindow = undefined;
        });

        /**
         * If you install `show: true` then it can cause issues when trying to close the window.
         * Use `show: false` and listener events `ready-to-show` to fix these issues.
         *
         * @see https://github.com/electron/electron/issues/25012
         */
        mainWindow.on('ready-to-show', () => {
            mainWindow?.show();

            // open developer tools when using development mode
            if (isDev) mainWindow.webContents.openDevTools();
        });

        return mainWindow;
    }

    public sendEvent(channel: string, ...args: any[]): void {
        this.mainWindow?.webContents.send(channel, ...args);
    }
}
