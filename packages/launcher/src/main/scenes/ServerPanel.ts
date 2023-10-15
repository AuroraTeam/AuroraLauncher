import { EVENTS } from 'common/channels';
import { ipcMain } from 'electron';
import { Service } from 'typedi';

import { IHandleable } from '../core/IHandleable';
import { GameService } from '../game/GameService';

@Service()
export class ServerPanelScene implements IHandleable {
    constructor(private gameService: GameService) {}

    initHandlers() {
        ipcMain.handle(EVENTS.SCENES.SERVER_PANEL.GET_PROFILE, () =>
            this.gameService.getProfile(),
        );
        ipcMain.handle(EVENTS.SCENES.SERVER_PANEL.GET_SERVER, () =>
            this.gameService.getServer(),
        );
        ipcMain.on(EVENTS.SCENES.SERVER_PANEL.START_GAME, () =>
            this.gameService.startGame(),
        );
    }
}
