import { AbstractProvider } from "./AbstractProvider"

export class AcceptAuthProvider extends AbstractProvider {
    type = "accept"
    config: any

    emit(login: string): string | boolean {
        return login
    }
}

export class Config {}
