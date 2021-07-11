import { execSync } from "child_process"
import * as crypto from "crypto"
import * as fs from "fs"
import * as path from "path"

import { LogHelper } from "../helpers/LogHelper"
import { StorageHelper } from "../helpers/StorageHelper"

export class AuthlibManager {
    private publicKeyPath = path.join(StorageHelper.authlibDir, "yggdrasil_session_pubkey.der")
    private privateKeyPath = path.join(StorageHelper.authlibDir, "private.pem")
    private privateKey: Buffer

    constructor() {
        if (fs.existsSync(this.privateKeyPath) && fs.existsSync(this.publicKeyPath))
            LogHelper.info("Keys exists, skip generate")
        else this.generateKeys()
        this.build()

        // init private key
        this.privateKey = fs.readFileSync(this.privateKeyPath)
    }

    public regenerateKeys(): void {
        this.generateKeys()
        this.privateKey = fs.readFileSync(this.privateKeyPath)
        fs.unlinkSync(path.join(StorageHelper.authlibDir, "lib/build/libs"))
        this.build()
    }

    private generateKeys(): void {
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

    public getSignature(data: string): string {
        const sign = crypto.createSign("sha1")
        sign.update(data)
        sign.end()
        return sign.sign(this.privateKey, "base64")
    }

    public build(): void {
        const libDir = path.join(StorageHelper.authlibDir, "lib")
        if (!fs.existsSync(libDir)) {
            LogHelper.info("Authlib not found! Cloning ...")
            execSync("git clone https://github.com/AuroraTeam/Authlib-Aurora.git lib", {
                cwd: StorageHelper.authlibDir,
            })
        }

        const authlibJarPath = path.join(StorageHelper.authlibDir, "authlib.jar")
        if (!fs.existsSync(authlibJarPath)) {
            LogHelper.info("Build Authlib...")
            fs.copyFileSync(this.publicKeyPath, path.join(libDir, "src/main/resources/yggdrasil_session_pubkey.der"))
            execSync("gradlew build", { cwd: libDir })
            fs.copyFileSync(path.join(libDir, "build/libs/authlib.jar"), authlibJarPath)
        }
    }
}
