import { Server } from '@aurora-launcher/core';
import { ipcRenderer } from 'electron';

import { EVENTS } from '../../common/channels';

export default class ServersListScene {
    static getServers(): Promise<Server[]> {
        return ipcRenderer.invoke(EVENTS.SCENES.SERVERS_LIST.GET_SERVERS);
    }

    static selectServer(server: Server) {
        return ipcRenderer.invoke(
            EVENTS.SCENES.SERVERS_LIST.SELECT_SERVER,
            server,
        );
    }
}
