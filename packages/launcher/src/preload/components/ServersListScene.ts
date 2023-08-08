import { ipcRenderer } from 'electron';

import { API_GET_SERVERS_HANDLER } from '../../common/channels';

export default class ServersListScene {
    static getServers(): Promise<any[]> {
        return ipcRenderer.invoke(API_GET_SERVERS_HANDLER);
    }
}
