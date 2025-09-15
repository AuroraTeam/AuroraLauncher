import { AuthType } from "../AuthType";

export const LAUNCHER_METHOD = "/launcher";

export interface LauncherResponse {
    settings: {
        authType: AuthType;
    };
}
