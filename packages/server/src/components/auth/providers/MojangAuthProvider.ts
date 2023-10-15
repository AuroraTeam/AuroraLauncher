import { AuthResponseData, HttpHelper } from "@aurora-launcher/core";

import { AuthProvider } from "./AuthProvider";

// TODO: Очистить имплементацию, перенести обработку на лаунчер дабы избежать угон акков через лаунчсервер
export class MojangAuthProvider implements AuthProvider {
    async auth(username: string, password: string): Promise<AuthResponseData> {
        const result = await HttpHelper.postJson<AuthenticateResponse>(
            new URL("authenticate", "https://authserver.mojang.com"),
            {
                agent: {
                    name: "Minecraft",
                    version: 1,
                },
                username,
                password,
            },
        );

        return {
            username: result.selectedProfile.name,
            userUUID: result.selectedProfile.id,
            accessToken: result.accessToken,
        };
    }

    // These methods don't need implementation
    join(): void {}
    hasJoined(): void {}
    profile(): void {}
    privileges(): void {}
    profiles(): void {}
}

interface AuthenticateResponse {
    user: {
        username: string;
        properties: {
            name: string;
            value: string;
        }[];
        id: string;
    };
    clientToken: string;
    accessToken: string;
    availableProfiles: [
        {
            name: string;
            id: string;
        },
    ];
    selectedProfile: {
        name: string;
        id: string;
    };
}
