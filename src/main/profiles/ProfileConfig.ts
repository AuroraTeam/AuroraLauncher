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

import { v4 } from "uuid"

export class ClientProfile {
    constructor(config: ClientProfileConfig) {
        Object.assign(this, this.defaults, config)
        this.validate()
    }

    validate(): void {
        return // TODO Валидация конфигов
    }

    private get defaults(): ClientProfileConfig {
        return {
            configVersion: 0,
            uuid: v4(),
            servers: [
                {
                    ip: "127.0.0.1",
                    port: "25565",
                    title: "clientTitle",
                    whiteListType: "null",
                },
            ],
            sortIndex: 0,
            version: "1.16.5",
            clientDir: "clientDir",
            assetsIndex: "1.16.5",
            assetsDir: "assetsDir",
            update: [],
            updateVerify: [],
            updateExclusions: [],
            mainClass: "net.minecraft.client.main.Main",
            classPath: ["libraries", "minecraft.jar"],
            jvmArgs: [],
            clientArgs: [],
        }
    }

    public toString(): string {
        return JSON.stringify(this, null, 4)
    }
}

export interface ClientProfileConfig {
    //Don`t touch
    configVersion: number

    // Profile information
    uuid: string
    sortIndex: number
    servers: ProfileServer[]

    // Client
    version: string
    clientDir: string

    // Assets
    assetsIndex: string
    assetsDir: string

    // Updates
    update: string[]
    updateVerify: string[]
    updateExclusions: string[]
    // updateOptional: ProfileOptional[]

    // Launch client
    mainClass: string
    classPath: string[]
    jvmArgs: string[]
    clientArgs: string[]
}

export interface ProfileServer {
    ip: string
    port: string
    title: string

    // Whitelist
    whiteListType: "null" | "users" | "uuids" | "permissions"
    whiteListPermisson?: number // permission в виде битового флага (пока только как возможный вариант)
    whiteListUsers?: string[] // Список игроков по никнейму
    whiteListUUIDs?: string[] // Список игроков по uuid
    hideProfile?: boolean
    message?: string
}

// export interface ProfileOptional {
//     id: number
//     name: string
//     description: string
//     mark: boolean
//     filename: string
//     conflict: number[]
//     children: ProfileOptional[]
// }
