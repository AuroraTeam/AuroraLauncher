import { ipcRenderer } from 'electron';

import { API_HAS_CONNECTED_HANDLER } from '../../common/channels';

export default class API {
    static hasConnected(): Promise<boolean> {
        return ipcRenderer.invoke(API_HAS_CONNECTED_HANDLER);
    }
}
