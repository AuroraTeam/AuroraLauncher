import { ipcRenderer } from 'electron';

import { GAME_START_EVENT } from '../../common/channels';

export default class Game {
    /**
     * Start the game
     * @param csl Print to console wrapper
     */
    static start(
        profile: object,
        csl: (string: string) => void,
        progress: (data: object) => void,
        callback: () => void
    ) {
        ipcRenderer.send(GAME_START_EVENT, {
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
