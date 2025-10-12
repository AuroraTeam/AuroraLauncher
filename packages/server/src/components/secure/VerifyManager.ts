import { privateDecrypt, privateEncrypt } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

import { Service } from "@freshgum/typedi";
import { SecureHelper, StorageHelper } from "@root/helpers";

@Service([])
export class VerifyManager {
    private publicKeyPath = resolve(StorageHelper.storageDir, "public.pem");
    private privateKeyPath = resolve(StorageHelper.storageDir, "private.pem");
    private privateKey!: Buffer;

    constructor() {
        try {
            this.readAndSetKey();
        } catch {
            this.generateKeys();
            this.readAndSetKey();
        }
    }

    public encryptToken(token: string): string {
        return privateEncrypt(this.privateKey, Buffer.from(token, "hex")).toString("hex");
    }

    public decryptToken(token: string): string {
        return privateDecrypt(this.privateKey, Buffer.from(token, "hex")).toString("hex");
    }

    private readAndSetKey() {
        this.privateKey = readFileSync(this.privateKeyPath);
    }

    /**
     * It generates a pair of RSA keys, saves them to the file system.
     */
    private generateKeys() {
        const keys = SecureHelper.generateRsaKeys();

        writeFileSync(this.privateKeyPath, keys.privateKey);
        writeFileSync(this.publicKeyPath, keys.publicKey);
    }
}
