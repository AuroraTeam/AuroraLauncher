import crypto from "crypto"
import fs from "fs"
import { join } from "path"

import { LogHelper, StorageHelper } from "@root/utils"
import { injectable, singleton } from "tsyringe"

import { LangManager } from "../langs"

type HashesMap = Map<string, HashedFile[]>
type totalDirs = "assets" | "libraries" | "instances"

@singleton()
@injectable()
export class InstancesManager {
    hashedDirs = {
        assets: new Map() as HashesMap,
        libraries: new Map() as HashesMap,
        instances: new Map() as HashesMap,
    }

    constructor(private readonly langManager: LangManager) {
        this.hashDirs(["assets", "libraries", "instances"])
    }

    // TODO move to constructor?
    hashDirs(totalDirs: totalDirs[]): void {
        totalDirs.forEach((dir) => {
            const folders = fs
                .readdirSync(join(StorageHelper.filesDir, dir), {
                    withFileTypes: true,
                })
                .filter((folder) => folder.isDirectory())

            if (folders.length === 0)
                return LogHelper.info(
                    this.langManager.getTranslate.InstancesManager.syncSkip,
                    dir.charAt(0).toUpperCase() + dir.slice(1)
                )

            LogHelper.info(this.langManager.getTranslate.InstancesManager.sync)

            folders.forEach(({ name }) => {
                const startTime = Date.now()

                this.hashedDirs[dir].set(
                    name,
                    this.hashDir(join(StorageHelper.filesDir, dir, name))
                )

                LogHelper.info(
                    this.langManager.getTranslate.InstancesManager.syncTime,
                    name,
                    Date.now() - startTime
                )
            })
        })

        LogHelper.info(this.langManager.getTranslate.InstancesManager.syncEnd)
    }

    hashDir(dir: string, arrayOfFiles: HashedFile[] = []): HashedFile[] {
        fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
            const file = join(dir, entry.name)
            if (entry.isDirectory()) {
                arrayOfFiles.concat(this.hashDir(file, arrayOfFiles))
            } else {
                arrayOfFiles.push(this.hashFile(file))
            }
        })
        return arrayOfFiles
    }

    hashFile(path: string): HashedFile {
        return {
            path: path.replace(StorageHelper.instancesDir, ""),
            size: fs.statSync(path).size,
            hashsum: crypto
                .createHash("sha1")
                .update(fs.readFileSync(path))
                .digest("hex"),
        }
    }
}

export type HashedFile = {
    path: string
    hashsum: string
    size: number
}
