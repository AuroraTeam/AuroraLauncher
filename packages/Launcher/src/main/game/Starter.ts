import { spawn } from 'child_process';
import fs from 'fs';
import { delimiter, join } from 'path';

import { IpcMainEvent, ipcMain } from 'electron';
import { Launcher } from 'main/core/Launcher';
import { LogHelper } from 'main/helpers/LogHelper';
import { StorageHelper } from 'main/helpers/StorageHelper';
import { coerce, gte, lte } from 'semver';

import { GAME_START_EVENT } from '../../common/channels';
import { ClientArgs } from './IClientArgs';
import { Updater } from './Updater';

export class Starter {
    static setHandler(): void {
        ipcMain.on(GAME_START_EVENT, (event, clientArgs) =>
            Starter.startGame(event, clientArgs)
        );
    }

    static async startGame(
        event: IpcMainEvent,
        clientArgs: ClientArgs
    ): Promise<void> {
        try {
            await Updater.checkClient(event, clientArgs);
        } catch (_) {
            event.reply('stopGame');
            return;
        }
        await this.start(event, clientArgs);
    }

    static async start(
        event: IpcMainEvent,
        clientArgs: ClientArgs
    ): Promise<void> {
        const clientDir = join(StorageHelper.clientsDir, clientArgs.clientDir);
        const assetsDir = join(StorageHelper.assetsDir, clientArgs.assetsDir);

        const clientVersion = coerce(clientArgs.version);
        if (clientVersion === null) {
            Launcher.window.sendEvent(
                'textToConsole',
                'invalig client version'
            );
            LogHelper.error('invalig client version');
            return;
        }

        const gameArgs: string[] = [];

        gameArgs.push('--version', clientArgs.version);
        gameArgs.push('--gameDir', clientDir);
        gameArgs.push('--assetsDir', assetsDir);

        if (gte(clientVersion, '1.6.0')) {
            this.gameLauncher(gameArgs, clientArgs, clientVersion.version);
        } else {
            gameArgs.push(clientArgs.username);
            gameArgs.push(clientArgs.accessToken);
        }

        const librariesDirectory = join(clientDir, 'libraries');
        const nativesDirectory = join(clientDir, 'natives');

        const classPath: string[] = [];
        if (clientArgs.classPath !== undefined) {
            clientArgs.classPath.forEach((fileName) => {
                const filePath = join(clientDir, fileName);
                if (fs.statSync(filePath).isDirectory()) {
                    classPath.push(...this.scanDir(librariesDirectory));
                } else {
                    classPath.push(filePath);
                }
            });
        } else {
            Launcher.window.sendEvent('textToConsole', 'classPath is empty');
            LogHelper.error('classPath is empty');
            return;
        }

        const jvmArgs = [];

        // TODO Убрать костыль
        // jvmArgs.push(
        //     '-javaagent:../../authlib-injector.jar=http://localhost:1370'
        // );

        jvmArgs.push(`-Djava.library.path=${nativesDirectory}`);

        if (clientArgs.jvmArgs?.length > 0) {
            jvmArgs.push(...clientArgs.jvmArgs);
        }

        jvmArgs.push('-cp', classPath.join(delimiter));
        jvmArgs.push(clientArgs.mainClass);

        jvmArgs.push(...gameArgs);
        if (clientArgs.clientArgs?.length > 0) {
            jvmArgs.push(...clientArgs.clientArgs);
        }

        const gameProccess = spawn('java', jvmArgs, {
            cwd: clientDir,
        });

        gameProccess.stdout.on('data', (data: Buffer) => {
            Launcher.window.sendEvent('textToConsole', data.toString());
            LogHelper.info(data.toString());
        });

        gameProccess.stderr.on('data', (data: Buffer) => {
            Launcher.window.sendEvent('textToConsole', data.toString());
            LogHelper.error(data.toString());
        });

        gameProccess.on('close', () => {
            event.reply('stopGame');
            LogHelper.info('Game stop');
        });
    }

    private static scanDir(dir: string, list: string[] = []): string[] {
        if (fs.statSync(dir).isDirectory()) {
            for (const fdir of fs.readdirSync(dir)) {
                this.scanDir(join(dir, fdir), list);
            }
        } else {
            list.push(dir);
        }
        return list;
    }

    static gameLauncher(
        gameArgs: string[],
        clientArgs: ClientArgs,
        clientVersion: string
    ): void {
        gameArgs.push('--username', clientArgs.username);

        if (gte(clientVersion, '1.7.2')) {
            gameArgs.push('--uuid', clientArgs.userUUID);
            gameArgs.push('--accessToken', clientArgs.accessToken);

            if (gte(clientVersion, '1.7.3')) {
                gameArgs.push('--assetIndex', clientArgs.assetsIndex);

                if (lte(clientVersion, '1.9.0')) {
                    gameArgs.push('--userProperties', '{}');
                }
            }

            if (gte(clientVersion, '1.7.4')) {
                gameArgs.push('--userType', 'mojang');
            }

            if (gte(clientVersion, '1.9.0')) {
                gameArgs.push('--versionType', 'AuroraLauncher v0.0.3');
            }
        } else {
            gameArgs.push('--session', clientArgs.accessToken);
        }
    }
}
