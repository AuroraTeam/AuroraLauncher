import { mkdirSync } from 'fs';
import { dirname, join } from 'path';

import { Profile } from '@aurora-launcher/core';
import { api as apiConfig } from '@config';
import { HttpHelper } from 'main/helpers/HttpHelper';
import { LogHelper } from 'main/helpers/LogHelper';
import { StorageHelper } from 'main/helpers/StorageHelper';
import pMap from 'p-map';
import { Service } from 'typedi';

import { APIManager } from '../api/APIManager';
import { LauncherWindow } from '../core/LauncherWindow';

@Service()
export class Updater {
    constructor(private window: LauncherWindow, private api: APIManager) {}

    async validateClient(clientArgs: Profile) {
        await this.hash(clientArgs);
        await this.download(clientArgs);
    }

    async hash(clientArgs: Profile): Promise<void> {
        // TODO Здесь должен быть код, который будет проверять хеш файлов
    }

    async download(clientArgs: Profile): Promise<void> {
        const parentDir = StorageHelper.clientsDir;
        this.window.sendEvent('textToConsole', `Load client files\n`);

        const hashes = await this.api.getUpdates(clientArgs.clientDir);

        if (!hashes) {
            this.window.sendEvent('textToConsole', `client not found\n`);
            LogHelper.error(`client not found`);
            return;
        }

        hashes.sort((a, b) => b.size - a.size);
        const totalSize = hashes.reduce((prev, cur) => prev + cur.size, 0);
        let loaded = 0;

        await pMap(
            hashes,
            async (hash) => {
                const filePath = join(parentDir, hash.path);
                mkdirSync(dirname(filePath), { recursive: true });

                const fileUrl = new URL(
                    `files/clients/${hash.path.replace('\\', '/')}`,
                    apiConfig.web
                );

                try {
                    await HttpHelper.downloadFile(fileUrl, filePath);
                } catch (error) {
                    this.window.sendEvent(
                        'textToConsole',
                        `file ${fileUrl} not found\n`
                    );
                    LogHelper.error(`file ${fileUrl} not found`);
                    return;
                }

                this.window.sendEvent(
                    'textToConsole',
                    `File ${hash.path} downloaded \n`
                );

                this.window.sendEvent('loadProgress', {
                    total: totalSize,
                    loaded: (loaded += hash.size),
                });
            },
            { concurrency: 4 }
        );
    }
}
