import * as crypto from "crypto"
import * as fs from "fs"
import * as path from "path"

import { LogHelper } from "../helpers/LogHelper"
import { StorageHelper } from "../helpers/StorageHelper"

export class AuthlibManager {
    private publicKeyPath = path.join(StorageHelper.authlibDir, "public.pem")
    private privateKeyPath = path.join(StorageHelper.authlibDir, "private.pem")
    private privateKey: Buffer
    private publicKey: string

    constructor() {
        if (fs.existsSync(this.privateKeyPath) && fs.existsSync(this.publicKeyPath))
            LogHelper.info("Keys exists, skip generate")
        else this.generateKeys()
        this.setKeys()
    }

    public regenerateKeys(): void {
        this.generateKeys()
        this.setKeys()
    }

    private setKeys(): void {
        this.privateKey = fs.readFileSync(this.privateKeyPath)
        this.publicKey = fs.readFileSync(this.publicKeyPath).toString()
    }

    private generateKeys(): void {
        const keys = crypto.generateKeyPairSync("rsa", {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: "spki",
                format: "pem",
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

    public getSignature(data: string): string {
        const sign = crypto.createSign("sha1")
        sign.update(data)
        sign.end()
        return sign.sign(this.privateKey, "base64")
    }

    public getPublicKey(): string {
        return this.publicKey
    }
}
