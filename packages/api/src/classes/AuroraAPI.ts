import {
    HttpHelper,
    LAUNCHER_METHOD,
    LauncherResponse,
    PROFILE_METHOD,
    ProfileRequestData,
    ProfileResponseData,
    SERVERS_METHOD,
    ServersResponseData,
    UPDATES_METHOD,
    UpdatesRequestData,
    UpdatesResponseData,
    VERIFY_METHOD,
    VerifyRequestData,
    VerifyResponseData,
} from "@aurora-launcher/core";

// TODO Отвязать от внутренних хелперов ???

export class AuroraAPI {
    constructor(private baseUrl: string) {}

    launcherRequest(): Promise<LauncherResponse> {
        return HttpHelper.getResourceFromJson<LauncherResponse>(
            new URL(LAUNCHER_METHOD, this.baseUrl),
        );
    }

    serversRequest(): Promise<ServersResponseData> {
        return HttpHelper.getResourceFromJson<ServersResponseData>(
            new URL(SERVERS_METHOD, this.baseUrl),
        );
    }

    profileRequest(data: ProfileRequestData): Promise<ProfileResponseData> {
        return HttpHelper.postJson<ProfileResponseData>(
            new URL(PROFILE_METHOD, this.baseUrl),
            data,
        );
    }

    updateRequest(data: UpdatesRequestData): Promise<UpdatesResponseData> {
        return HttpHelper.postJson<UpdatesResponseData>(
            new URL(UPDATES_METHOD, this.baseUrl),
            data,
        );
    }

    verifyRequest(data: VerifyRequestData): Promise<VerifyResponseData> {
        return HttpHelper.postJson<VerifyResponseData>(
            new URL(VERIFY_METHOD, this.baseUrl),
            data,
        );
    }
}
