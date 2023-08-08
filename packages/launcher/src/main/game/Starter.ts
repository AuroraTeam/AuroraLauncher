import { spawn } from 'child_process';
import fs from 'fs';
import { delimiter, join } from 'path';

import { ClientArguments } from '@aurora-launcher/core';
import { IpcMainEvent, ipcMain } from 'electron';
import { IHandleable } from 'main/core/IHandleable';
import { LauncherWindow } from 'main/core/LauncherWindow';
import { LogHelper } from 'main/helpers/LogHelper';
import { StorageHelper } from 'main/helpers/StorageHelper';
import { coerce, gte, lte } from 'semver';
import { Service } from 'typedi';

import { EVENTS } from '../../common/channels';
import { AuthorizationService, Session } from '../api/AuthorizationService';
import { Updater } from './Updater';

@Service()
export class Starter implements IHandleable {
    constructor(
        private window: LauncherWindow,
        private authorizationService: AuthorizationService,
        private updater: Updater
    ) {}

    initHandlers(): void {
        ipcMain.on(EVENTS.SCENES.SERVER_PANEL.START_GAME, (event, clientArgs) =>
            this.startGame(event, clientArgs)
        );
    }

    private async startGame(
        event: IpcMainEvent,
        clientArgs: ClientArguments
    ): Promise<void> {
        try {
            await this.updater.validateClient(clientArgs);
        } catch (error) {
            LogHelper.debug(error);
            event.reply('stopGame');
            return;
        }
        await this.start(event, clientArgs);
    }

    async start(
        event: IpcMainEvent,
        clientArgs: ClientArguments
    ): Promise<void> {
        const clientDir = join(StorageHelper.clientsDir, clientArgs.clientDir);
        const assetsDir = join(StorageHelper.assetsDir);

        const clientVersion = coerce(clientArgs.version);
        if (clientVersion === null) {
            this.window.sendEvent('textToConsole', 'Invalig client version');
            LogHelper.error('Invalig client version');
            return;
        }

        const userArgs = this.authorizationService.getCurrentSession();
        if (!userArgs) {
            this.window.sendEvent('textToConsole', 'Auth requierd');
            LogHelper.error('Auth requierd');
            return;
        }

        const gameArgs: string[] = [];

        gameArgs.push('--version', clientArgs.version);
        gameArgs.push('--gameDir', clientDir);
        gameArgs.push('--assetsDir', assetsDir);

        if (gte(clientVersion, '1.6.0')) {
            this.gameLauncher(
                gameArgs,
                clientArgs,
                clientVersion.version,
                userArgs
            );
        } else {
            gameArgs.push(userArgs.username);
            gameArgs.push(userArgs.accessToken);
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
            this.window.sendEvent('textToConsole', 'classPath is empty');
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
            this.window.sendEvent('textToConsole', data.toString());
            LogHelper.info(data.toString());
        });

        gameProccess.stderr.on('data', (data: Buffer) => {
            this.window.sendEvent('textToConsole', data.toString());
            LogHelper.error(data.toString());
        });

        gameProccess.on('close', () => {
            event.reply('stopGame');
            LogHelper.info('Game stop');
        });
    }

    private scanDir(dir: string, list: string[] = []): string[] {
        if (fs.statSync(dir).isDirectory()) {
            for (const fdir of fs.readdirSync(dir)) {
                this.scanDir(join(dir, fdir), list);
            }
        } else {
            list.push(dir);
        }
        return list;
    }

    private gameLauncher(
        gameArgs: string[],
        clientArgs: ClientArguments,
        clientVersion: string,
        userArgs: Session
    ): void {
        gameArgs.push('--username', userArgs.username);

        if (gte(clientVersion, '1.7.2')) {
            gameArgs.push('--uuid', userArgs.userUUID);
            gameArgs.push('--accessToken', userArgs.accessToken);

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
            gameArgs.push('--session', userArgs.accessToken);
        }
    }
}
