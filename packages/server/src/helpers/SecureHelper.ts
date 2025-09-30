import { generateKeyPairSync, randomBytes } from "crypto";

export class SecureHelper {
    static generateRsaKeys() {
        return generateKeyPairSync("rsa", {
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
    }

    static generateRandomToken(length: number = 32) {
        return randomBytes(length).toString("hex");
    }
}
