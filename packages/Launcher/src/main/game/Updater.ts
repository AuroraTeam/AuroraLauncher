import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

import { api as apiConfig } from '@config';
import { IpcMainEvent } from 'electron/main';
import { Launcher } from 'main/core/Launcher';
import { HttpHelper } from 'main/helpers/HttpHelper';
import { LogHelper } from 'main/helpers/LogHelper';
import { StorageHelper } from 'main/helpers/StorageHelper';
import pMap from 'p-map';

import { ClientArgs } from './IClientArgs';

export class Updater {
    static async checkClient(
        _: IpcMainEvent,
        clientArgs: ClientArgs
    ): Promise<void> {
        await this.hash(clientArgs.clientDir);
    }

    static async hash(dir: string): Promise<void> {
        if (!existsSync(join(StorageHelper.clientsDir, dir))) {
            await this.download(dir);
        } else {
            // TODO Здесь должен быть код, который будет проверять хеш файлов
        }
    }

    static async download(dir: string): Promise<void> {
        const parentDir = StorageHelper.clientsDir;
        Launcher.window.sendEvent('textToConsole', `Load client files\n`);

        const { hashes } = await Launcher.api.getUpdates(dir);

        if (!hashes) {
            Launcher.window.sendEvent('textToConsole', `client not found\n`);
            LogHelper.error(`client not found`);
            throw undefined; // Ну можно и получше что-то придумать
        }

        hashes.sort((a, b) => b.size - a.size);
        const totalSize = hashes.reduce((prev, cur) => prev + cur.size, 0);
        let loaded = 0;

        await pMap(
            hashes,
            async (hash) => {
                const filePath = join(parentDir, hash.path);
                mkdirSync(dirname(filePath), { recursive: true });
                await HttpHelper.downloadFile(
                    new URL(
                        `files/${hash.path.replace('\\', '/')}`,
                        apiConfig.web
                    ),
                    filePath
                );
                Launcher.window.sendEvent(
                    'textToConsole',
                    `File ${hash.path} downloaded \n`
                );
                Launcher.window.sendEvent('loadProgress', {
                    total: totalSize,
                    loaded: (loaded += hash.size),
                });
            },
            { concurrency: 4 }
        );
    }
}
