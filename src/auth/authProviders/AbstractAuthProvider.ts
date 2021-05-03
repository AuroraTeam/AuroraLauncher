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

import { ResponseData } from "../../api/websocket/types/Response"
import { AbstractProvider } from "../AbstractProvider"
import { AcceptAuthProvider } from "./AcceptAuthProvider"

export abstract class AbstractAuthProvider extends AbstractProvider {
    abstract auth(username: string, password: string): PromiseOr<AuthResponseData>

    abstract join(accessToken: string, userUUID: string, serverId: string): PromiseOr<void>

    abstract hasJoined(username: string, serverId: string): PromiseOr<HasJoinedResponseData>

    abstract profile(userUUID: string): PromiseOr<ProfileResponseData>

    public static getDefaultConfig(): AbstractAuthProviderConfig {
        return {
            type: AcceptAuthProvider.getType(),
        }
    }
}

export interface AbstractAuthProviderConfig {
    type: string
}

export interface AuthResponseData extends ResponseData {
    username: string
    userUUID: string
    accessToken: string
}

export interface HasJoinedResponseData extends ResponseData {
    userUUID: string
    skinUrl?: string
    capeUrl?: string
}

export interface ProfileResponseData extends ResponseData {
    username: string
    skinUrl?: string
    capeUrl?: string
}
