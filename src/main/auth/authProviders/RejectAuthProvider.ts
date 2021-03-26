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

import { App } from "../../LauncherServer"
import { wsErrorResponseWithoutUUID } from "../../requests/types/AbstractRequest"
import { AbstractAuthProvider } from "./AbstractAuthProvider"

export class RejectAuthProvider extends AbstractAuthProvider {
    config = new RejectAuthProviderConfig()

    constructor() {
        super("reject")
    }

    emit(): wsErrorResponseWithoutUUID {
        return {
            code: 200,
            message: this.config.message,
        }
    }
}

export class RejectAuthProviderConfig {
    message: string = App.ConfigManager.getProperty("auth.authProvider.message", true) || "Auth rejected"
}
