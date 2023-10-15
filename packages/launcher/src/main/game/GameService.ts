import { Profile, Server } from '@aurora-launcher/core';
import { Service } from 'typedi';

import { APIManager } from '../api/APIManager';
import { LogHelper } from '../helpers/LogHelper';
import { Starter } from './Starter';
import { Updater } from './Updater';
import { GameWindow } from './GameWindow';

@Service()
export class GameService {
    private selectedServer?: Server;
    private selectedProfile?: Profile;

    constructor(
        private apiService: APIManager,
        private gameUpdater: Updater,
        private gameStarter: Starter,
        private gameWindow: GameWindow,
    ) {}

    async setServer(server: Server) {
        this.selectedServer = server;
        this.selectedProfile = await this.apiService.getProfile(
            server.profileUUID,
        );
    }

    getServer() {
        return this.selectedServer;
    }

    getProfile() {
        return this.selectedProfile;
    }

    async startGame() {
        const profile = this.selectedProfile;
        const server = this.selectedServer;

        if (!profile || !server) {
            this.gameWindow.sendToConsole('Error: Profile or server not set');
            this.gameWindow.stopGame();
            return;
        }

        try {
            await this.gameUpdater.validateClient(profile);
            await this.gameStarter.start(profile);
        } catch (error) {
            LogHelper.error(error);
            this.gameWindow.sendToConsole(`${error}`);
            this.gameWindow.stopGame();
        }
    }
}
