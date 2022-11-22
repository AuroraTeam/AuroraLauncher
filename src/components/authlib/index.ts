import crypto from "crypto"
import fs from "fs"
import { resolve } from "path"

import { LogHelper, StorageHelper } from "@root/utils"
import { injectable, singleton } from "tsyringe"

import { LangManager } from "../langs"

@singleton()
@injectable()
export class AuthlibManager {
    private publicKeyPath = resolve(StorageHelper.authlibDir, "public.pem")
    private privateKeyPath = resolve(StorageHelper.authlibDir, "private.pem")
    private privateKey: Buffer
    private publicKey: string

    constructor(private readonly langManager: LangManager) {
        if (this.keysExists()) {
            LogHelper.info(langManager.getTranslate.AuthlibManager.keysExists)
        } else {
            this.generateKeys()
        }
        this.setKeys()
    }

    private keysExists() {
        return (
            fs.existsSync(this.privateKeyPath) &&
            fs.existsSync(this.publicKeyPath)
        )
    }

    private setKeys(): void {
        this.privateKey = fs.readFileSync(this.privateKeyPath)
        this.publicKey = fs.readFileSync(this.publicKeyPath).toString()
    }

    /**
     * It generates a pair of RSA keys, saves them to the file system.
     */
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
        LogHelper.info(
            this.langManager.getTranslate.AuthlibManager.privateKeySaved
        )
        fs.writeFileSync(this.publicKeyPath, keys.publicKey)
        LogHelper.info(
            this.langManager.getTranslate.AuthlibManager.privateKeySaved
        )
    }

    /**
     * Issuing signature
     * @param {string} data - The data to be signed.
     * @returns The signature of the data.
     */
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
