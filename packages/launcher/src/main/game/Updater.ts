import { mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { dirname, join } from 'path';

import {
    HashHelper,
    HttpHelper,
    JsonHelper,
    Profile,
} from '@aurora-launcher/core';
import { api as apiConfig } from '@config';
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

        const assetsIndexPath = `indexes/${clientArgs.assetsIndex}.json`;
        const filePath = join(StorageHelper.assetsDir, assetsIndexPath);
        mkdirSync(dirname(filePath), { recursive: true });

        const assetsIndexUrl = this.getFileUrl(assetsIndexPath, 'assets');
        const assetsFile = await HttpHelper.getResource(assetsIndexUrl);
        await writeFile(filePath, assetsFile);

        const { objects } = JsonHelper.fromJson<Assets>(assetsFile);

        const assetsHashes = Object.values(objects)
            .sort((a, b) => b.size - a.size)
            .map((hash) => ({
                ...hash,
                path: `objects/${hash.hash.slice(0, 2)}/${hash.hash}`,
            }));

        const assetsObjectsDir = join(StorageHelper.assetsDir, 'objects');

        const totalSize = assetsHashes.reduce(
            (prev, cur) => prev + cur.size,
            0,
        );
        let loaded = 0;

        await pMap(
            assetsHashes,
            async (hash) => {
                await this.validateAndDownloadFile(
                    hash.path,
                    hash.hash,
                    assetsObjectsDir,
                    'assets',
                );

                this.gameWindow.sendProgress({
                    total: totalSize,
                    loaded: (loaded += hash.size),
                });
            },
            { concurrency: 4 },
        );
    }

    async validateLibraries(clientArgs: Profile): Promise<void> {
        this.gameWindow.sendToConsole('Load libraries files');

        let loaded = 0;

        await pMap(
            clientArgs.libraries.filter(
                () => true,
                // && library.rules // TODO
            ),
            async (library) => {
                await this.validateAndDownloadFile(
                    library.path,
                    library.sha1,
                    StorageHelper.librariesDir,
                    'libraries',
                );

                this.gameWindow.sendProgress({
                    total: clientArgs.libraries.length,
                    loaded: (loaded += 1),
                });
            },
            { concurrency: 4 },
        );
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
                await this.validateAndDownloadFile(
                    hash.path,
                    hash.sha1,
                    StorageHelper.clientsDir,
                    'clients',
                );

                this.gameWindow.sendProgress({
                    total: totalSize,
                    loaded: (loaded += hash.size),
                });
            },
            { concurrency: 4 },
        );
    }

    private getFileUrl(
        path: string,
        type: 'clients' | 'libraries' | 'assets',
    ): URL {
        return new URL(
            `files/${type}/${path.replace('\\', '/')}`,
            apiConfig.web,
        );
    }

    async validateAndDownloadFile(
        path: string,
        sha1: string,
        rootDir: string,
        type: 'clients' | 'libraries' | 'assets',
    ): Promise<void> {
        const filePath = join(rootDir, path);
        mkdirSync(dirname(filePath), { recursive: true });

        const fileUrl = this.getFileUrl(path, type);

        try {
            const fileHash = await HashHelper.getSHA1fromFile(filePath);
            if (fileHash === sha1) return;
        } catch (error) {
            // ignore
        }

        try {
            await HttpHelper.downloadFile(fileUrl, filePath);
        } catch (error) {
            throw new Error(`file ${fileUrl} not found`);
        }
    }
}

// TODO: Move to @aurora-launcher/core
/**
 * For assets
 */
export interface Assets {
    /**
     * Найдено в https://launchermeta.mojang.com/v1/packages/3d8e55480977e32acd9844e545177e69a52f594b/pre-1.6.json \
     * до версии 1.6 (если точнее до снапшота 13w23b)
     */
    map_to_resources?: boolean;
    /**
     * Найдено в https://launchermeta.mojang.com/v1/packages/770572e819335b6c0a053f8378ad88eda189fc14/legacy.json \
     * начиная с версии версии 1.6 (если точнее с снапшота 13w24a) и до 1.7.2 (13w48b)
     */
    virtual?: boolean;
    objects: { [key: string]: Asset };
}

export interface Asset {
    hash: string;
    size: number;
}
