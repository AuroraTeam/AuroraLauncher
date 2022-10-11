import crypto from "crypto"
import fs from "fs"
import path from "path"

import { App } from "@root/app"
import { LogHelper, StorageHelper } from "@root/utils"

export class InstancesManager {
    hashedDirs: Map<string, HashedFile[]> = new Map()

    constructor() {
        this.hashInstancesDir()
    }

    hashInstancesDir(): void {
        const folders = fs
            .readdirSync(StorageHelper.instancesDir, { withFileTypes: true })
            .filter((folder) => folder.isDirectory())

        if (folders.length === 0) return LogHelper.info(App.LangManager.getTranslate.InstancesManager.syncSkip)

        LogHelper.info(App.LangManager.getTranslate.InstancesManager.sync)

        folders.forEach(({ name }) => {
            const startTime = Date.now()

            this.hashedDirs.set(name, this.hashDir(path.join(StorageHelper.instancesDir, name)))

            LogHelper.info(App.LangManager.getTranslate.InstancesManager.syncTime, name, Date.now() - startTime)
        })

        LogHelper.info(App.LangManager.getTranslate.InstancesManager.syncEnd)
    }

    /**
     * It takes a directory, reads all the files in it, and returns an array of objects containing the
     * file name and its hash
     * @param {string} dir - The directory to hash
     * @param {HashedFile[]} arrayOfFiles - This is the array that will be returned. It is initialized
     * as an empty array.
     * @returns An array of HashedFiles
     */
    hashDir(dir: string, arrayOfFiles: HashedFile[] = []): HashedFile[] {
        fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
            const file = path.join(dir, entry.name)
            if (entry.isDirectory()) {
                arrayOfFiles.concat(this.hashDir(file, arrayOfFiles))
            } else {
                arrayOfFiles.push(this.hashFile(file))
            }
        })
        return arrayOfFiles
    }

    /**
     * It takes a path to a file, and returns an object containing the path, size, and hash of the file
     * @param {string} path - The path to the file you want to hash.
     * @returns A hashed file.
     */
    hashFile(path: string): HashedFile {
        return {
            path: path.replace(StorageHelper.instancesDir, ""),
            size: fs.statSync(path).size,
            hashsum: crypto.createHash("sha1").update(fs.readFileSync(path)).digest("hex"),
        }
    }
}

export type HashedFile = {
    path: string
    hashsum: string
    size: number
}
