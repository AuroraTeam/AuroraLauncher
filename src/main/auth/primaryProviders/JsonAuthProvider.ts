import { AbstractProvider } from "./AbstractProvider"

export class JsonAuthProvider extends AbstractProvider {
    type = "json"
    config: Config

    emit(login: string, password: string, ip: string): object {
        return
    }
}

export interface Config {
    url?: string
    secret?: string
}

interface Response {
    login?: string
    error?: string
}

interface Request {
    login: string
    password: string
    ip: string
    secret: string
}
