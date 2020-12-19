import { v5 } from "uuid"

import { wsResponseWithoutUUID } from "../../requests/types/AbstractRequest"
import { AbstractProvider } from "./AbstractProvider"

export class AcceptAuthProvider extends AbstractProvider {
    type = "accept"
    config: any

    emit(login: string): wsResponseWithoutUUID {
        return {
            data: {
                login,
                userUUID: v5(login, "814f98b5-f66d-4456-87dc-f4eed8f6ca73"),
            },
        }
    }
}

export class Config {}
