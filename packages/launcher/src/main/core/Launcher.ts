import { Service } from 'typedi';

import { APIManager } from '../api/APIManager';
import { LogHelper } from '../helpers/LogHelper';
import { StorageHelper } from '../helpers/StorageHelper';
import { LoginScene } from '../scenes/Login';
import { ServerPanelScene } from '../scenes/ServerPanel';
import { ServersListScene } from '../scenes/ServersList';
import { LauncherWindow } from './LauncherWindow';

@Service()
export class Launcher {
    constructor(
        private window: LauncherWindow,
        private apiManager: APIManager,

        private loginScene: LoginScene,
        private serversListScene: ServersListScene,
        private serverPanelScene: ServerPanelScene,
    ) {
        this.init();
    }

    async init() {
        StorageHelper.createMissing();

        await this.apiManager.initConnection();

        this.loginScene.initHandlers();
        this.serversListScene.initHandlers();
        this.serverPanelScene.initHandlers();

        this.window.createWindow();
        LogHelper.info('Launcher started');
    }
}
