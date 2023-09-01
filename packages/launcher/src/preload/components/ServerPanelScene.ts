import { Profile, Server } from '@aurora-launcher/core';
import { ipcRenderer } from 'electron';

import { EVENTS } from '../../common/channels';
import { LoadProgress } from '../../common/types';

export default class ServerPanelScene {
    static getProfile(): Promise<Profile> {
        return ipcRenderer.invoke(EVENTS.SCENES.SERVER_PANEL.GET_PROFILE);
    }

    static getServer(): Promise<Server> {
        return ipcRenderer.invoke(EVENTS.SCENES.SERVER_PANEL.GET_SERVER);
    }

    static startGame(
        consoleListener: (string: string) => void,
        progressListener: (data: LoadProgress) => void,
        stopGameListener: () => void,
    ) {
        ipcRenderer.send(EVENTS.SCENES.SERVER_PANEL.START_GAME);

        ipcRenderer.on(
            EVENTS.SCENES.SERVER_PANEL.TEXT_TO_CONSOLE,
            (_, string) => consoleListener(string),
        );

        ipcRenderer.on(EVENTS.SCENES.SERVER_PANEL.LOAD_PROGRESS, (_, data) =>
            progressListener(data),
        );

        ipcRenderer.once(EVENTS.SCENES.SERVER_PANEL.STOP_GAME, () => {
            ipcRenderer.removeAllListeners(
                EVENTS.SCENES.SERVER_PANEL.TEXT_TO_CONSOLE,
            );
            ipcRenderer.removeAllListeners(
                EVENTS.SCENES.SERVER_PANEL.LOAD_PROGRESS,
            );
            stopGameListener();
        });
    }
}
