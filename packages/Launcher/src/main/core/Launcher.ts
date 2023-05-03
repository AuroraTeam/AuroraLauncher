import { Starter } from 'main/game/Starter';

import { LogHelper } from '../helpers/LogHelper';
import { StorageHelper } from '../helpers/StorageHelper';
import { APIManager } from './APIManager';
import { LauncherWindow } from './LauncherWindow';

export class Launcher {
    public static readonly window = new LauncherWindow();
    public static readonly api = new APIManager();

    constructor() {
        Starter.setHandler();
        StorageHelper.createMissing();
        LogHelper.info('Launcher started');
    }
}
