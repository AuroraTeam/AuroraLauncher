import { ipcRenderer } from 'electron';

import { EVENTS } from '../../common/channels';

export default class Window {
    /**
     * Hide window
     */
    static hide() {
        ipcRenderer.send(EVENTS.WINDOW.HIDE);
    }

    /**
     * Close window
     */
    static close() {
        ipcRenderer.send(EVENTS.WINDOW.CLOSE);
    }
}
