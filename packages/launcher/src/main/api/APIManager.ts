import { AuroraAPI } from '@aurora-launcher/api';
import { api as apiConfig } from '@config';
import { ipcMain } from 'electron';
import { Service } from 'typedi';

import { EVENTS } from '../../common/channels';
import { IHandleableDep } from '../core/IHandleable';

@Service()
export class APIManager implements IHandleableDep {
    private api = new AuroraAPI(apiConfig.ws || 'ws://localhost:1370', {
        onClose: () => {
            setTimeout(() => this.initConnection(), 5000);
        },
    });

    initHandlers() {
        ipcMain.handle(EVENTS.SCENES.SERVERS_LIST.GET_SERVERS, () =>
            this.api.getServers()
        );
        ipcMain.handle(
            EVENTS.SCENES.SERVER_PANEL.GET_PROFILE,
            (_, uuid: string) => this.api.getProfile(uuid)
        );
    }

    async initConnection() {
        try {
            await this.api.connect();
        } catch (error) {
            //
        }
    }

    public getUpdates(dir: string) {
        return this.api.getUpdates(dir);
    }

    public auth(login: string, password: string) {
        return this.api.auth(login, password);
    }
}
