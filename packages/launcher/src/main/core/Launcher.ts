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
        private window: LauncherWindow,
        private apiManager: APIManager,
        private authorizationService: AuthorizationService,

        private starter: Starter
    ) {
        this.init();
    }

    async init() {
        StorageHelper.createMissing();

        // TODO REMOVE
        this.apiManager.initHandlers();
        await this.apiManager.initConnection();

        this.authorizationService.initHandlers();
        this.starter.initHandlers();

        this.window.createWindow();
        LogHelper.info('Launcher started');
    }
}
