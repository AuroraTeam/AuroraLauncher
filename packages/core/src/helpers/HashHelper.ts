import { BinaryLike, createHash } from "crypto"
import { readFile } from "fs/promises"

export class HashHelper {
    static getHash(str: BinaryLike, type: string) {
        return createHash(type).update(str).digest("hex")
    }

    static async getHashFromFile(path: string, type: string) {
        return this.getHash(await readFile(path), type)
    }
}
