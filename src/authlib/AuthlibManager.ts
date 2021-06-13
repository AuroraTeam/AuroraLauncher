/**
 * AuroraLauncher LauncherServer - Server for AuroraLauncher
 * Copyright (C) 2020 - 2021 AuroraTeam

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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

        // init private key
        this.privateKey = fs.readFileSync(this.privateKeyPath)
    }

    // public regenerateKeys(): void {
    //     this.generateKeys()
    //     this.privateKey = fs.readFileSync(this.privateKeyPath)
    // }

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
}
