import { contextBridge } from 'electron';

import _API from './components/API';
import LoginScene from './components/LoginScene';
import ServerPanel from './components/ServerPanelScene';
import ServersList from './components/ServersListScene';
import Window from './components/Window';

// export для типизации
export const API = {
    window: {
        hide: Window.hide,
        close: Window.close,
    },
    scenes: {
        login: {
            auth: LoginScene.auth,
        },
        serversList: {
            getServers: ServersList.getServers,
        },
        serverPanel: {
            getProfile: ServerPanel.getProfile,
            startGame: ServerPanel.startGame,
        },
    },
    api: {
        hasConnected: _API.hasConnected,
    },
};

contextBridge.exposeInMainWorld('launcherAPI', API);
