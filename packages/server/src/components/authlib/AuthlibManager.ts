import { createSign, generateKeyPairSync } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

import { LogHelper, StorageHelper } from "@root/utils";
import { Service } from "typedi";

import { LangManager } from "../langs";

@Service()
export class AuthlibManager {
    private publicKeyPath = resolve(StorageHelper.authlibDir, "public.pem");
    private privateKeyPath = resolve(StorageHelper.authlibDir, "private.pem");
    private privateKey: Buffer;
    private publicKey: string;

    constructor(private readonly langManager: LangManager) {
        try {
            this.readAndSetKeys();
            LogHelper.info(langManager.getTranslate.AuthlibManager.keysExists);
        } catch (error) {
            this.generateKeys();
            this.readAndSetKeys();
        }
    }

    private readAndSetKeys() {
        this.privateKey = readFileSync(this.privateKeyPath);
        this.publicKey = readFileSync(this.publicKeyPath).toString();
    }

    /**
     * It generates a pair of RSA keys, saves them to the file system.
     */
    private generateKeys() {
        const keys = generateKeyPairSync("rsa", {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: "spki",
                format: "pem",
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
            },
        });

        writeFileSync(this.privateKeyPath, keys.privateKey);
        LogHelper.info(this.langManager.getTranslate.AuthlibManager.privateKeySaved);

        writeFileSync(this.publicKeyPath, keys.publicKey);
        LogHelper.info(this.langManager.getTranslate.AuthlibManager.privateKeySaved);
    }

    /**
     * Issuing signature
     * @param {string} data - The data to be signed.
     * @returns The signature of the data.
     */
    public getSignature(data: string): string {
        const sign = createSign("sha1").end(data);
        return sign.sign(this.privateKey, "base64");
    }

    public getPublicKey(): string {
        return this.publicKey;
    }
}
