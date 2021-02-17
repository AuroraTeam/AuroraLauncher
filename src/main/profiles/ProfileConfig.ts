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

export interface ProfileConfig {
    //Don`t touch
    configVersion: string

    // Profile information
    // title: string
    uuid: string
    servers: ProfileServer[]
    sortIndex: number

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
    whiteListType: "users" | "uuids" | "permissions"
    whiteListPermisson: number // permission в виде битового флага (пока только как возможный вариант)
    whiteListUsers: string[] // Список игроков по никнейму
    whiteListUUIDs: string[] // Список игроков по uuid
    hideProfile: boolean
    message: string
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
