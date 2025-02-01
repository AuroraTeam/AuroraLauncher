export class SkinConfig {
    skinUrl: string;
    capeUrl: string;

    static getDefaultConfig(): SkinConfig {
        return {
            skinUrl: "https://api.aurora-launcher.ru/mojang/username/skin/{username}",
            capeUrl: "https://api.aurora-launcher.ru/mojang/username/cape/{username}",
        };
    }
}
