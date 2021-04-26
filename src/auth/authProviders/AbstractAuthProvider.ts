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

import { ResponseData } from "../../api/types/Response"
import { AbstractProvider } from "../AbstractProvider"
import { AcceptAuthProvider } from "./AcceptAuthProvider"

export abstract class AbstractAuthProvider extends AbstractProvider {
    abstract auth(login: string, password: string): PromiseOr<AuthResponseData>

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

// TODO Указание доп.параметров для запуска клиента при использовании различных провайдеров
// Для работы Authlib
