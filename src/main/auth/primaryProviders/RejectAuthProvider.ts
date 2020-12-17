import { wsErrorResponseWithoutUUID } from "../../requests/types/AbstractRequest"
import { AbstractProvider } from "./AbstractProvider"

export class RejectAuthProvider extends AbstractProvider {
    type = "reject"
    config: any

    emit(): wsErrorResponseWithoutUUID {
        return {
            code: 200,
            message: "Auth rejected",
        }
    }
}

export class Config {}
