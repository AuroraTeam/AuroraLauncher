import { AuroraAPI } from '@aurora-launcher/api';
import { api as apiConfig } from '@config';
import { Service } from 'typedi';

import { LogHelper } from '../helpers/LogHelper';

@Service()
export class APIManager {
    private api = new AuroraAPI(apiConfig.ws || 'ws://localhost:1370', {
        onClose: () => setTimeout(() => this.initConnection(), 5000),
    });

    async initConnection() {
        try {
            await this.api.connect();
        } catch (error) {
            LogHelper.error(error);
        }
    }

    public auth(login: string, password: string) {
        return this.api.auth(login, password);
    }

    public getServers() {
        return this.api.getServers();
    }

    public getProfile(uuid: string) {
        return this.api.getProfile(uuid);
    }

    public getUpdates(dir: string) {
        return this.api.getUpdates(dir);
    }
}
