import { EVENTS } from 'common/channels';
import { ipcMain } from 'electron';
import { Service } from 'typedi';

import { APIManager } from '../api/APIManager';
import { IHandleable } from '../core/IHandleable';

@Service()
export class ServerPanelScene implements IHandleable {
    constructor(private apiService: APIManager) {}

    initHandlers() {
        ipcMain.handle(
            EVENTS.SCENES.SERVER_PANEL.GET_PROFILE,
            (_, uuid: string) => this.apiService.getProfile(uuid)
        );
    }
}
