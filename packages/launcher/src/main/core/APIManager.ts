import { AuroraAPI } from '@aurora-launcher/api';
import { api as apiConfig } from '@config';
import { ipcMain } from 'electron';
import { Service } from 'typedi';

import {
    API_GET_PROFILE_HANDLER,
    API_GET_SERVERS_HANDLER,
    API_GET_STATUS_HANDLER,
} from '../../common/channels';
import { IHandleable } from './IHandleable';

// TODO Подумать над реализацией корректной обработки запросов и отлова ошибок

@Service()
export class APIManager implements IHandleable {
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
    }

    initHandlers() {
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

    public auth(login: string, password: string) {
        return this.api.auth(login, password);
    }
}
