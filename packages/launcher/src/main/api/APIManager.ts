import { AuroraAPI } from '@aurora-launcher/api';
import { api as apiConfig } from '@config';
import { ipcMain } from 'electron';
import { Service } from 'typedi';

import {
    API_GET_PROFILE_HANDLER,
    API_GET_SERVERS_HANDLER,
    API_HAS_CONNECTED_HANDLER,
} from '../../common/channels';
import { IHandleableDep } from '../core/IHandleable';

@Service()
export class APIManager implements IHandleableDep {
    private api = new AuroraAPI(apiConfig.ws || 'ws://localhost:1370', {
        onClose: () => {
            this.connectStatus = false;
            setTimeout(() => this.initConnection(), 5000);
        },
    });
    private connectStatus = false;

    initHandlers() {
        ipcMain.handle(API_HAS_CONNECTED_HANDLER, () => this.hasConnected());
        ipcMain.handle(API_GET_SERVERS_HANDLER, () => this.api.getServers());
        ipcMain.handle(API_GET_PROFILE_HANDLER, (_, uuid: string) =>
            this.api.getProfile(uuid)
        );
    }

    async initConnection() {
        try {
            await this.api.connect();
            this.connectStatus = true;
        } catch (error) {
            //
        }
    }

    hasConnected() {
        return this.connectStatus;
    }

    public getUpdates(dir: string) {
        return this.api.getUpdates(dir);
    }

    public auth(login: string, password: string) {
        return this.api.auth(login, password);
    }
}
