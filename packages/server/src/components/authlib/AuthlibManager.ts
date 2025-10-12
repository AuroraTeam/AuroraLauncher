import { createSign } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

import { Service } from "@freshgum/typedi";
import { LogHelper, SecureHelper, StorageHelper } from "@root/helpers";

import { LangManager } from "../langs/LangManager";

@Service([LangManager])
export class AuthlibManager {
    private publicKeyPath = resolve(StorageHelper.authlibDir, "public.pem");
    private privateKeyPath = resolve(StorageHelper.authlibDir, "private.pem");
    private privateKey!: Buffer;
    private publicKey!: string;

    constructor(private readonly langManager: LangManager) {
        try {
            this.readAndSetKeys();
            LogHelper.info(langManager.getTranslate.AuthlibManager.keysExists);
        } catch {
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
        const keys = SecureHelper.generateRsaKeys();

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
