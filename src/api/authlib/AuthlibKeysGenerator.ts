import * as crypto from "crypto"
import * as fs from "fs"
import * as path from "path"

import { LogHelper } from "../../helpers/LogHelper"
import { StorageHelper } from "../../helpers/StorageHelper"

export class AuthlibKeysGenerator {
    private publicKeyPath = path.join(StorageHelper.authlibDir, "yggdrasil_session_pubkey.der")
    private privateKeyPath = path.join(StorageHelper.authlibDir, "private.pem")

    constructor() {
        this.generateKeys()
    }

    public generateKeys(): void {
        if (fs.existsSync(this.privateKeyPath) && fs.existsSync(this.publicKeyPath))
            return LogHelper.info("Keys exists, skip generate")

        const keys = crypto.generateKeyPairSync("rsa", {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: "pkcs1",
                format: "der",
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
            },
        })

        fs.writeFileSync(this.privateKeyPath, keys.privateKey)
        LogHelper.info("Private key saved")
        fs.writeFileSync(this.publicKeyPath, keys.publicKey)
        LogHelper.info("Public key saved")
    }

    public getSignature(data: Buffer): string {
        return crypto.privateEncrypt(fs.readFileSync(this.privateKeyPath), data).toString("base64")
    }
}
