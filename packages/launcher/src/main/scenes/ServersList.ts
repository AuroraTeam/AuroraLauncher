import { Server } from '@aurora-launcher/core';
import { EVENTS } from 'common/channels';
import { ipcMain } from 'electron';
import { Service } from 'typedi';

import { APIManager } from '../api/APIManager';
import { IHandleable } from '../core/IHandleable';
import { GameService } from '../game/GameService';

@Service()
export class ServersListScene implements IHandleable {
    constructor(
        private apiService: APIManager,
        private gameService: GameService,
    ) {}

    initHandlers() {
        ipcMain.handle(EVENTS.SCENES.SERVERS_LIST.GET_SERVERS, () =>
            this.apiService.getServers(),
        );
        ipcMain.handle(
            EVENTS.SCENES.SERVERS_LIST.SELECT_SERVER,
            (_, server: Server) => this.gameService.setServer(server),
        );
    }
}
