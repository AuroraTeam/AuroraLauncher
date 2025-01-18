export class SkinConfig {
    skinUrl: string;
    capeUrl: string;

    static getDefaultConfig(): SkinConfig {
        return {
            skinUrl: "https://api.aurora-launcher.ru/mojang/skin?username={username}",
            capeUrl: "https://api.aurora-launcher.ru/mojang/cape?username={username}",
        };
    }
}
