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

import { IncomingMessage, ServerResponse } from "http"

import { JsonHelper } from "@root/helpers/JsonHelper"
import UUIDHelper from "@root/helpers/UUIDHelper"
import { App } from "@root/LauncherServer"

import { AbstractRequest } from "../../AbstractRequest"

export class JoinRequest extends AbstractRequest {
    method = "POST"
    url = /^\/authlib\/session\/minecraft\/join$/

    async emit(req: IncomingMessage, res: ServerResponse): Promise<void> {
        let data: any = await this.getPostData(req)
        res.statusCode = 400

        if (data.length === 0) {
            res.write(this.returnError("Bad Request"))
            return res.end()
        }

        data = JsonHelper.fromJSON(data)

        if (
            this.isInvalidValue(data.accessToken) ||
            this.isInvalidValue(data.selectedProfile) ||
            this.isInvalidValue(data.serverId)
        ) {
            res.write(this.returnError("Bad Request"))
            return res.end()
        }

        try {
            await App.AuthManager.getAuthProvider().join(
                data.accessToken,
                UUIDHelper.getWithDashes(data.selectedProfile),
                data.serverId
            )
        } catch (error) {
            res.write(
                this.returnError("ForbiddenOperationException", "Invalid credentials. Invalid username or password.")
            )
            return res.end()
        }

        res.statusCode = 204
        res.end()
    }
}
