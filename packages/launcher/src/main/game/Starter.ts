import { spawn } from 'child_process';
import { delimiter, join } from 'path';

import { Profile } from '@aurora-launcher/core';
import { LauncherWindow } from 'main/core/LauncherWindow';
import { LogHelper } from 'main/helpers/LogHelper';
import { StorageHelper } from 'main/helpers/StorageHelper';
import { coerce, gte, lte } from 'semver';
import { Service } from 'typedi';

import { AuthorizationService, Session } from '../api/AuthorizationService';
import { Updater } from './Updater';

@Service()
export class Starter {
    constructor(
        private window: LauncherWindow,
        private authorizationService: AuthorizationService,
        private updater: Updater,
    ) {}

    async start(clientArgs: Profile): Promise<void> {
        const clientDir = join(StorageHelper.clientsDir, clientArgs.clientDir);

        const clientVersion = coerce(clientArgs.version);
        if (clientVersion === null) {
            throw new Error('Invalig client version');
        }

        const userArgs = this.authorizationService.getCurrentSession();
        if (!userArgs) {
            throw new Error('Auth requierd');
        }

        const gameArgs: string[] = [];

        gameArgs.push('--version', clientArgs.version);
        gameArgs.push('--gameDir', clientDir);
        gameArgs.push('--assetsDir', StorageHelper.assetsDir);

        if (gte(clientVersion, '1.6.0')) {
            this.gameLauncher(
                gameArgs,
                clientArgs,
                clientVersion.version,
                userArgs,
            );
        } else {
            gameArgs.push(userArgs.username);
            gameArgs.push(userArgs.accessToken);
        }

        const classPath = clientArgs.libraries
            .filter(
                (library) => library.type === 'library',
                // && library.rules // TODO
            )
            .map(({ path }) => {
                return join(StorageHelper.librariesDir, path);
            });
        classPath.push(join(clientDir, clientArgs.gameJar));

        const jvmArgs = [];

        // TODO Убрать костыль
        // jvmArgs.push(
        //     '-javaagent:../../authlib-injector.jar=http://localhost:1370'
        // );

        const nativesDirectory = this.prepareNatives(clientArgs);
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
            this.window.sendEvent('stopGame');
            LogHelper.info('Game stop');
        });
    }
    private gameLauncher(
        gameArgs: string[],
        clientArgs: Profile,
        clientVersion: string,
        userArgs: Session,
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

    prepareNatives(clientArgs: Profile) {
        const nativesDir = join(StorageHelper.clientsDir, 'natives');

        const nativesFiles = clientArgs.libraries.filter(
            (library) => library.type === 'native',
            // && library.rules // TODO
        );

        // ZipHelper
        // TODO

        return nativesDir;
    }
}
