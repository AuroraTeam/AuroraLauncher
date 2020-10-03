export class AuthHandlerConfig {
    type: string

    static getDefaults(): AuthHandlerConfig {
        const defaults = new AuthHandlerConfig()
        defaults.type = "none"
        return defaults
    }
}
