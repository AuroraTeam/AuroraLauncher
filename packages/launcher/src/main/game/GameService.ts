import { ProfileConfig, Server } from '@aurora-launcher/core';
import { Service } from 'typedi';

import { EVENTS } from '../../common/channels';
import { APIManager } from '../api/APIManager';
import { LauncherWindow } from '../core/LauncherWindow';
import { LogHelper } from '../helpers/LogHelper';
import { Starter } from './Starter';
import { Updater } from './Updater';

@Service()
export class GameService {
    private selectedServer?: Server;
    private selectedProfile?: ProfileConfig;

    constructor(
        private window: LauncherWindow,
        private apiService: APIManager,
        private gameUpdater: Updater,
        private gameStarter: Starter
    ) {}

    async setServer(server: Server) {
        const { profile } = await this.apiService.getProfile(
            server.profileUUID
        );

        this.selectedServer = server;
        this.selectedProfile = profile;
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
            this.sendToConsole('[ERROR] Profile or server not set');
            this.stopGame();
            return;
        }

        try {
            await this.gameUpdater.validateClient(profile);
        } catch (error) {
            LogHelper.error(error);
            this.sendToConsole(`${error}`);
            this.stopGame();
            return;
        }
        await this.gameStarter.start(profile);
    }

    private sendToConsole(text: string) {
        this.window.sendEvent(
            EVENTS.SCENES.SERVER_PANEL.TEXT_TO_CONSOLE,
            `${text}\n`
        );
    }

    private sendProgress(progress: object) {
        //
    }

    private stopGame() {
        //
    }
}
