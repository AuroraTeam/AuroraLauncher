import { Profile, Server } from '@aurora-launcher/api';
import { Service } from 'typedi';

import { APIManager } from '../api/APIManager';
import { Starter } from './Starter';

@Service()
export class GameService {
    private selectedServer?: Server;
    private selectedProfile?: Profile;

    constructor(private apiService: APIManager, private gameStarter: Starter) {}

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

    startGame() {
        this.gameStarter.startGame(this.selectedProfile, this.selectedServer);
    }
}
