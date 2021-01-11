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

export class ProfileConfig {
    //Don`t touch
    configVersion: string

    // Profile information
    version: string
    title: string
    uuid: string
    server: ProfileServer[]
    sortIndex: number

    // Assets
    assetsIndex: string
    assetsDir: string

    // Updates
    updatesDir: string
    update: string[]
    updateWath: string[]
    wathExclusions: string[]
    updateOptional: ProfileOptional[]

    // Launch client
    classPath: string[]
    jvmArgs: string[]
    clientArgs: string[]
    mainClass: string

    // Whitelist
    whiteListUsers: string[]
    hideProfile: boolean
    message: string
}

export class ProfileOptional {
    id: number
    name: string
    description: string
    mark: boolean
    filename: string
    conflict: number[]
    children: ProfileOptional[]
}

export class ProfileServer {
    ip: string
    port: string
    title: string
}
