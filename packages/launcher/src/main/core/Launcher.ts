import { Starter } from 'main/game/Starter';

import { LogHelper } from '../helpers/LogHelper';
import { StorageHelper } from '../helpers/StorageHelper';
import { APIManager } from './APIManager';
import { LauncherWindow } from './LauncherWindow';

export class Launcher {
    readonly window = new LauncherWindow();
    readonly api = new APIManager();

    constructor() {
        Starter.setHandler();
        StorageHelper.createMissing();
        LogHelper.info('Launcher started');
    }
}
