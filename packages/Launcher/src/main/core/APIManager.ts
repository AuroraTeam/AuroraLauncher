import { api as apiConfig } from '@config';
import { AuroraAPI } from 'aurora-api';
import { ipcMain } from 'electron';

import {
    API_AUTH_HANDLER,
    API_GET_PROFILE_HANDLER,
    API_GET_SERVERS_HANDLER,
    API_GET_STATUS_HANDLER,
} from '../../common/channels';

// TODO Подумать над реализацией корректной обработки запросов и отлова ошибок

export class APIManager {
    private api = new AuroraAPI(apiConfig.ws || 'ws://localhost:1370');
    private tryConnect = false;
    private failedСonnection = false;

    constructor() {
        this.api
            .connect()
            .catch(() => {
                this.failedСonnection = true;
            })
            .finally(() => {
                this.tryConnect = true;
            });

        this.initMethods();
    }

    private initMethods() {
        ipcMain.handle(API_AUTH_HANDLER, (_, login: string, password: string) =>
            this.errorHandler(() => this.api.auth(login, password))
        );
        ipcMain.handle(API_GET_STATUS_HANDLER, () => this.getStatus());
        ipcMain.handle(API_GET_SERVERS_HANDLER, () =>
            this.errorHandler(() => this.api.getServers())
        );
        ipcMain.handle(API_GET_PROFILE_HANDLER, (_, uuid: string) =>
            this.errorHandler(() => this.api.getProfile(uuid))
        );
    }

    public getStatus(): 'connected' | 'failure' | 'connecting' {
        if (this.tryConnect && this.failedСonnection) return 'failure';
        if (this.tryConnect) return 'connected';
        return 'connecting';
    }

    private async errorHandler(callback: () => any) {
        try {
            return await callback();
        } catch (error) {
            return error;
        }
    }

    public getUpdates(dir: string) {
        return this.api.getUpdates(dir);
    }
}
