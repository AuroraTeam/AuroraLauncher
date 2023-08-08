import { ipcRenderer } from 'electron';

import { EVENTS } from '../../common/channels';

export default class ServersListScene {
    static getServers(): Promise<any[]> {
        return ipcRenderer.invoke(EVENTS.SCENES.SERVERS_LIST.GET_SERVERS);
    }
}
