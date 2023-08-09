import { Profile, Server } from '@aurora-launcher/api';
import { ipcRenderer } from 'electron';

import { EVENTS } from '../../common/channels';

export default class ServerPanelScene {
    static getProfile(): Promise<Profile> {
        return ipcRenderer.invoke(EVENTS.SCENES.SERVER_PANEL.GET_PROFILE);
    }

    static getServer(): Promise<Server> {
        return ipcRenderer.invoke(EVENTS.SCENES.SERVER_PANEL.GET_SERVER);
    }

    // TODO Rework
    static startGame(
        consoleListener: (string: string) => void,
        progressListener: (data: object) => void,
        stopGameListener: () => void
    ) {
        ipcRenderer.send(EVENTS.SCENES.SERVER_PANEL.START_GAME);

        ipcRenderer.on('textToConsole', (_e, string) => {
            consoleListener(string);
        });

        ipcRenderer.on('loadProgress', (_e, data) => {
            progressListener(data);
        });

        ipcRenderer.once('stopGame', () => {
            ipcRenderer.removeAllListeners('textToConsole');
            ipcRenderer.removeAllListeners('loadProgress');
            stopGameListener();
        });
    }
}
