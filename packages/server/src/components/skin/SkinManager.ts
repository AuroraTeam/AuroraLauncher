import { SkinConfig } from "../config/utils/SkinConfig";

export class SkinManager {
    private skinUrl: string;
    private capeUrl: string;

    constructor(skin: SkinConfig) {
        this.skinUrl = skin.skinUrl;
        this.capeUrl = skin.capeUrl;
    }

    getSkin(uuid: string, username: string): string {
        return this.skinUrl.replace("{uuid}", uuid).replace("{username}", username);
    }

    getCape(uuid: string, username: string) {
        return this.capeUrl.replace("{uuid}", uuid).replace("{username}", username);
    }

    getDomainUrl() {
        return new URL(this.skinUrl).hostname;
    }
}
