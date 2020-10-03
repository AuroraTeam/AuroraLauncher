export class TextureProviderConfig {
    type: string

    static getDefaults(): TextureProviderConfig {
        const defaults = new TextureProviderConfig()
        defaults.type = "none"
        return defaults
    }
}
