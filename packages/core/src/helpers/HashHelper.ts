import { BinaryLike, createHash } from "crypto"
import { readFile } from "fs/promises"

export class HashHelper {
    static getSHA1(str: BinaryLike) {
        return createHash("sha1").update(str).digest("hex")
    }

    static async getSHA1fromFile(path: string) {
        return this.getSHA1(await readFile(path))
    }
}
