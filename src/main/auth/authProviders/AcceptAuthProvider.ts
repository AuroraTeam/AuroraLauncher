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

// import { v4, v5 } from "uuid"

// import { wsResponseWithoutUUID } from "../../requests/types/AbstractRequest"
import { AbstractAuthProvider } from "./AbstractAuthProvider"

export class AcceptAuthProvider extends AbstractAuthProvider {
    constructor() {
        super("accept")
    }

    static getType(): string {
        return "accept"
    }

    // sessionsDB = new Map()

    emit(login: string): { data: { login: string } } {
        return {
            data: {
                login,
            },
        }
    }

    // emit(login: string): wsResponseWithoutUUID {
    //     const data = {
    //         login,
    //         userUUID: v5(login, "814f98b5-f66d-4456-87dc-f4eed8f6ca73"),
    //         accessToken: v4(),
    //     }

    //     this.sessionsDB.set(data.login, {
    //         ...data,
    //         serverID: undefined,
    //     })

    //     return { data }
    // }
}
