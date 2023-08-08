import { API_AUTH_HANDLER } from 'common/channels';
import { ipcMain } from 'electron';
import { Service } from 'typedi';

import { IHandleable } from '../core/IHandleable';
import { APIManager } from './APIManager';

export interface Session {
    username: string;
    userUUID: string;
    accessToken: string;
}

@Service()
export class AuthorizationService implements IHandleable {
    private currentSession?: Session;

    constructor(private apiService: APIManager) {}

    initHandlers() {
        ipcMain.handle(API_AUTH_HANDLER, (_, login: string, password: string) =>
            this.authorize(login, password)
        );
    }

    async authorize(login: string, password: string) {
        this.currentSession = await this.apiService.auth(login, password);
        return this.currentSession.username;
    }

    getCurrentSession() {
        return this.currentSession;
    }
}
