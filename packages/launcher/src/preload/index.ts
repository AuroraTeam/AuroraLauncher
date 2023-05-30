import { contextBridge, ipcRenderer } from 'electron';

import {
    API_AUTH_HANDLER,
    API_HAS_CONNECTED_HANDLER,
} from '../common/channels';
import Game from './components/Game';
import ServerList from './components/ServerList';
import ServerPanel from './components/ServerPanel';
import Window from './components/Window';

// export для типизации
export const API = {
    window: {
        hide: Window.hide,
        close: Window.close,
    },
    game: {
        start: Game.start,
    },
    auth: (login: string, password: string): Promise<string> =>
        ipcRenderer.invoke(API_AUTH_HANDLER, login, password),
    api: {
        hasConnected: (): Promise<boolean> =>
            ipcRenderer.invoke(API_HAS_CONNECTED_HANDLER),
        getServers: ServerList.getServers,
        getProfile: ServerPanel.getProfile,
    },
};

contextBridge.exposeInMainWorld('launcherAPI', API);
