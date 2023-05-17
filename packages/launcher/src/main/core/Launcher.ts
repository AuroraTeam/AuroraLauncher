import { Starter } from 'main/game/Starter';
import { Service } from 'typedi';

import { LogHelper } from '../helpers/LogHelper';
import { StorageHelper } from '../helpers/StorageHelper';
import { APIManager } from './APIManager';
import { AuthorizationService } from './AuthorizationService';
import { LauncherWindow } from './LauncherWindow';

@Service()
export class Launcher {
    constructor(
        window: LauncherWindow,
        apiManager: APIManager,
        authorizationService: AuthorizationService,

        starter: Starter
    ) {
        StorageHelper.createMissing();

        // TODO REMOVE
        apiManager.initHandlers();

        authorizationService.initHandlers();
        starter.initHandlers();

        window.createWindow();
        LogHelper.info('Launcher started');
    }
}
