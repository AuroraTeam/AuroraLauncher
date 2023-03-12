import crypto from "crypto";
import fs from "fs/promises";
import { join } from "path";

import { LogHelper, StorageHelper } from "@root/utils";
import { injectable, singleton } from "tsyringe";

import { LangManager } from "../langs";

type HashedFile = {
    path: string;
    hashsum: string;
    size: number;
};

type HashesMap = Map<string, HashedFile[]>;
type TotalDirs = "assets" | "libraries" | "instances";

@singleton()
@injectable()
export class InstancesManager {
    readonly hashedDirs: Record<TotalDirs, HashesMap> = {
        assets: new Map(),
        libraries: new Map(),
        instances: new Map(),
    };

    constructor(private readonly langManager: LangManager) {
        this.hashDirs(["assets", "libraries", "instances"]);
    }

    private async hashDirs(totalDirs: TotalDirs[]): Promise<void> {
        for (const dir of totalDirs) {
            const dirPath = join(StorageHelper.filesDir, dir);
            const folders = await fs.readdir(dirPath, { withFileTypes: true });
            const dirs = folders.filter((folder) => folder.isDirectory());

            if (dirs.length === 0) {
                LogHelper.info(
                    this.langManager.getTranslate.InstancesManager.syncSkip,
                    `${dir.charAt(0).toUpperCase()}${dir.slice(1)}`
                );
                continue;
            }

            LogHelper.info(this.langManager.getTranslate.InstancesManager.sync);

            for (const { name } of dirs) {
                const startTime = Date.now();

                this.hashedDirs[dir].set(
                    name,
                    await this.hashDir(join(StorageHelper.filesDir, dir, name))
                );

                LogHelper.info(
                    this.langManager.getTranslate.InstancesManager.syncTime,
                    name,
                    Date.now() - startTime
                );
            }
        }

        LogHelper.info(this.langManager.getTranslate.InstancesManager.syncEnd);
    }

    private async hashDir(
        dirPath: string,
        arrayOfFiles: HashedFile[] = []
    ): Promise<HashedFile[]> {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const entryPath = join(dirPath, entry.name);
            if (entry.isDirectory()) {
                arrayOfFiles = await this.hashDir(entryPath, arrayOfFiles);
            } else {
                arrayOfFiles.push(await this.hashFile(entryPath));
            }
        }

        return arrayOfFiles;
    }

    private async hashFile(path: string): Promise<HashedFile> {
        const data = await fs.readFile(path);
        const size = (await fs.stat(path)).size;
        const hashsum = crypto.createHash("sha1").update(data).digest("hex");

        return {
            path: path.replace(StorageHelper.instancesDir, ""),
            hashsum,
            size,
        };
    }
}
