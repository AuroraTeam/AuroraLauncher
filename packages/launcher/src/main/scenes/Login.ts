import { EVENTS } from 'common/channels';
import { ipcMain } from 'electron';
import { Service } from 'typedi';

import { AuthorizationService } from '../api/AuthorizationService';
import { IHandleable } from '../core/IHandleable';

@Service()
export class LoginScene implements IHandleable {
    constructor(private authorizationService: AuthorizationService) {}

    initHandlers() {
        ipcMain.handle(
            EVENTS.SCENES.LOGIN.AUTH,
            (_, login: string, password: string) =>
                this.authorizationService.authorize(login, password),
        );
    }
}
