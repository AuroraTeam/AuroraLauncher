import { ipcRenderer } from 'electron';

import { WINDOW_CLOSE_EVENT, WINDOW_HIDE_EVENT } from '../../common/channels';

export default class Window {
    /**
     * Hide window
     */
    static hide() {
        ipcRenderer.send(WINDOW_HIDE_EVENT);
    }

    /**
     * Close window
     */
    static close() {
        ipcRenderer.send(WINDOW_CLOSE_EVENT);
    }
}
