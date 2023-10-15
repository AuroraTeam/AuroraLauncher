import { BinaryLike, createHash } from "crypto"
import { readFile } from "fs/promises"

export class HashHelper {
    static getHash(str: BinaryLike, type: "sha1" | "sha256") {
        return createHash(type).update(str).digest("hex")
    }

    static async getHashfromFile(path: string, type: "sha1" | "sha256") {
        return this.getHash(await readFile(path), type)
    }
}
