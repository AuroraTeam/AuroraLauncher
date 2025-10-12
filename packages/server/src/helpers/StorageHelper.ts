import { PathLike } from "fs";
import { rm } from "fs/promises";
import { dirname, resolve } from "path";

import { StorageHelper as CoreStorageHelper } from "@aurora-launcher/core";

import { SystemHelper } from "./SystemHelper";

export class StorageHelper extends CoreStorageHelper {
    static readonly storageDir: string = this.getStorageDir();
    static readonly gameFilesDir: string = this.resolveDir("gameFiles");
    static readonly releaseDir: string = super.resolveDir(this.gameFilesDir, "release");
    static readonly clientsDir: string = super.resolveDir(this.gameFilesDir, "clients");
    static readonly assetsDir: string = super.resolveDir(this.gameFilesDir, "assets");
    static readonly assetsIndexesDir: string = super.resolveDir(this.assetsDir, "indexes");
    static readonly assetsObjectsDir: string = super.resolveDir(this.assetsDir, "objects");
    static readonly librariesDir: string = super.resolveDir(this.gameFilesDir, "libraries");
    static readonly profilesDir: string = this.resolveDir("profiles");
    static readonly modulesDir: string = this.resolveDir("modules");
    static readonly authlibDir: string = this.resolveDir("authlib");
    static readonly logsDir: string = this.resolveDir("logs");

    private static getStorageDir() {
        return process.env.AURORA_STORAGE_OVERRIDE
            ? resolve(process.env.AURORA_STORAGE_OVERRIDE)
            : SystemHelper.isStandalone()
              ? dirname(process.execPath)
              : __dirname;
    }

    static override resolveDir(dirname: string) {
        return super.resolveDir(this.storageDir, dirname);
    }

    static rmdirRecursive(path: PathLike) {
        return rm(path, { recursive: true, force: true });
    }
}
