import { PathLike, existsSync, mkdirSync } from "fs";
import { rm } from "fs/promises";
import { dirname, resolve } from "path";

import { StorageHelper as CoreStorageHelper } from "@aurora-launcher/core";

import { SystemHelper } from "./SystemHelper";
import { LogHelper } from "./LogHelper";

export class StorageHelper extends CoreStorageHelper {
    /* Folders */
    static readonly storageDir: string = process.env.AURORA_STORAGE_OVERRIDE 
        ? resolve(process.env.AURORA_STORAGE_OVERRIDE) 
        : SystemHelper.isStandalone()
            ? dirname(process.execPath)
            : __dirname;
    static readonly gameFilesDir: string = resolve(this.storageDir, "gameFiles");
    static readonly clientsDir: string = resolve(this.gameFilesDir, "clients");
    static readonly assetsDir: string = resolve(this.gameFilesDir, "assets");
    static readonly assetsIndexesDir: string = resolve(this.assetsDir, "indexes");
    static readonly assetsObjectsDir: string = resolve(this.assetsDir, "objects");
    static readonly librariesDir: string = resolve(this.gameFilesDir, "libraries");
    static readonly profilesDir: string = resolve(this.storageDir, "profiles");
    static readonly modulesDir: string = resolve(this.storageDir, "modules");
    static readonly authlibDir: string = resolve(this.storageDir, "authlib");
    static readonly logsDir: string = resolve(this.storageDir, "logs");

    static validate() {
        const foldersToCreate: PathLike[] = [
            this.gameFilesDir,
            this.clientsDir,
            this.assetsDir,
            this.assetsIndexesDir,
            this.assetsObjectsDir,
            this.librariesDir,
            this.profilesDir,
            this.modulesDir,
            this.authlibDir,
            this.logsDir,
        ];

        for (const folder of foldersToCreate) {
            if (!existsSync(folder)) {
                mkdirSync(folder);
            }
        }
    }

    static rmdirRecursive(path: PathLike) {
        return rm(path, { recursive: true, force: true });
    }
}
