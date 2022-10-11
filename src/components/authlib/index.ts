import crypto from "crypto"
import fs from "fs"
import { resolve } from "path"

import { App } from "@root/app"

import { LogHelper, StorageHelper } from "@root/utils"

export class AuthlibManager {
    private publicKeyPath = resolve(StorageHelper.authlibDir, "public.pem")
    private privateKeyPath = resolve(StorageHelper.authlibDir, "private.pem")
    private privateKey: Buffer
    private publicKey: string

    constructor() {
        if (fs.existsSync(this.privateKeyPath) && fs.existsSync(this.publicKeyPath)) {
            LogHelper.info(App.LangManager.getTranslate.AuthlibManager.keysExists)
        } else {
            this.generateKeys()
        }
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
        LogHelper.info(App.LangManager.getTranslate.AuthlibManager.privateKeySaved)
        fs.writeFileSync(this.publicKeyPath, keys.publicKey)
        LogHelper.info(App.LangManager.getTranslate.AuthlibManager.privateKeySaved)
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
