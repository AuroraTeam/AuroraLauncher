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

import { IncomingMessage } from "http"

import { JsonHelper } from "../../../../../helpers/JsonHelper"
import UUIDHelper from "../../../../../helpers/UUIDHelper"
import { App } from "../../../../../LauncherServer"
import { CustomServerResponse } from "../../../WebRequestManager"
import { AbstractRequest } from "../../AbstractRequest"

export class JoinRequest extends AbstractRequest {
    method = "POST"
    url = /^\/authlib\/session\/minecraft\/join$/

    emit(req: IncomingMessage, res: CustomServerResponse): void {
        let data: any = ""
        req.on("data", (chunk) => {
            data += chunk
        })
        req.on("end", async () => {
            data = JsonHelper.fromJSON(data)

            if (
                this.isInvalidValue(data.accessToken) ||
                this.isInvalidValue(data.selectedProfile) ||
                this.isInvalidValue(data.serverId)
            )
                return res.writeStatus(400)

            try {
                await App.AuthManager.getAuthProvider().join(
                    data.accessToken,
                    UUIDHelper.getWithDashes(data.selectedProfile),
                    data.serverId
                )
            } catch (error) {
                return res.writeStatus(400)
            }

            res.writeStatus(204)
        })
    }
}
