import { mkdirSync } from 'fs';
import { dirname, join } from 'path';

import { HashHelper, Profile } from '@aurora-launcher/core';
import { api as apiConfig } from '@config';
import { HttpHelper } from 'main/helpers/HttpHelper';
import { LogHelper } from 'main/helpers/LogHelper';
import { StorageHelper } from 'main/helpers/StorageHelper';
import pMap from 'p-map';
import { Service } from 'typedi';

import { APIManager } from '../api/APIManager';
import { GameWindow } from './GameWindow';

@Service()
export class Updater {
    constructor(
        private api: APIManager,
        private gameWindow: GameWindow,
    ) {}

    async validateClient(clientArgs: Profile): Promise<void> {
        await this.validateAssets(clientArgs);
        await this.validateLibraries(clientArgs);
        await this.validateGameFiles(clientArgs);
    }

    async validateAssets(clientArgs: Profile): Promise<void> {
        this.gameWindow.sendToConsole('Load assets files');

        // TODO: Validate assets
    }

    async validateLibraries(clientArgs: Profile): Promise<void> {
        this.gameWindow.sendToConsole('Load libraries files');

        // TODO: Validate libraries
    }

    async validateGameFiles(clientArgs: Profile): Promise<void> {
        this.gameWindow.sendToConsole('Load client files');

        const hashes = await this.api.getUpdates(clientArgs.clientDir);
        if (!hashes) {
            throw new Error('Client not found');
        }

        hashes.sort((a, b) => b.size - a.size);
        const totalSize = hashes.reduce((prev, cur) => prev + cur.size, 0);
        let loaded = 0;

        await pMap(
            hashes,
            async (hash) => {
                const filePath = join(StorageHelper.clientsDir, hash.path);
                mkdirSync(dirname(filePath), { recursive: true });

                const fileUrl = new URL(
                    `files/clients/${hash.path.replace('\\', '/')}`,
                    apiConfig.web,
                );

                const fileHash = await HashHelper.getSHA1fromFile(filePath);
                if (fileHash === hash.sha1) {
                    this.gameWindow.sendToConsole(
                        `File ${hash.path} already downloaded`,
                    );
                    return;
                }

                try {
                    await HttpHelper.downloadFile(fileUrl, filePath);
                } catch (error) {
                    throw new Error(`file ${fileUrl} not found`);
                }

                this.gameWindow.sendToConsole(`File ${hash.path} downloaded`);

                this.gameWindow.sendProgress({
                    total: totalSize,
                    loaded: (loaded += hash.size),
                });
            },
            { concurrency: 4 },
        );
    }
}
