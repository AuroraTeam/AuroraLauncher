import { LauncherServer } from "../LauncherServer"

export class AuthManager {
    ls: LauncherServer

    constructor(ls: LauncherServer) {
        this.ls = ls
    }

    registerProviders(): void {}

    registerHandlers(): void {}

    registerTextureProviders(): void {}

    registerHwidHandlers(): void {}
}
