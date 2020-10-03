export class HwidHandlerConfig {
    type: string

    static getDefaults(): HwidHandlerConfig {
        const defaults = new HwidHandlerConfig()
        defaults.type = "none"
        return defaults
    }
}
