import { EVENTS } from 'common/channels';
import { ipcMain } from 'electron';
import { Service } from 'typedi';

import { APIManager } from '../api/APIManager';
import { IHandleable } from '../core/IHandleable';

@Service()
export class ServersListScene implements IHandleable {
    constructor(private apiService: APIManager) {}

    initHandlers() {
        ipcMain.handle(EVENTS.SCENES.SERVERS_LIST.GET_SERVERS, () =>
            this.apiService.getServers()
        );
    }
}
