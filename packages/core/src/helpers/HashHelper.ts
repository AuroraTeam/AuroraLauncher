import { createHash } from "crypto"
import { readFile } from "fs/promises"

export class HashHelper {
    static async getSHA1fromFile(path: string) {
        return createHash("sha1")
            .update(await readFile(path))
            .digest("hex")
    }
}
