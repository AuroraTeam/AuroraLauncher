export class SkinConfig {
    skinUrl: string;
    capeUrl: string;

    static getDefaultConfig(): SkinConfig {
        return {
            skinUrl: "https://skins.danielraybone.com/v1/skin/{username}",
            capeUrl: "https://skins.danielraybone.com/v1/cape/{username}",
        };
    }
}
