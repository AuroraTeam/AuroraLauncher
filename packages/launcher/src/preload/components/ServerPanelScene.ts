import { ipcRenderer } from 'electron';

import { EVENTS } from '../../common/channels';

export default class ServerPanelScene {
    static getProfile(uuid: string): Promise<any> {
        return ipcRenderer.invoke(EVENTS.SCENES.SERVER_PANEL.GET_PROFILE, uuid);
    }

    static startGame(
        profile: object,
        csl: (string: string) => void,
        progress: (data: object) => void,
        callback: () => void
    ) {
        ipcRenderer.send(EVENTS.SCENES.SERVER_PANEL.START_GAME, {
            ...profile,
            username: localStorage.getItem('username'),
            userUUID: localStorage.getItem('userUUID'),
            accessToken: localStorage.getItem('accessToken'),
        });

        ipcRenderer.on('textToConsole', (_e, string: string) => {
            csl(string);
        });

        ipcRenderer.on('loadProgress', (_e, data: object) => {
            progress(data);
        });

        ipcRenderer.once('stopGame', () => {
            ipcRenderer.removeAllListeners('textToConsole');
            callback();
        });
    }
}
