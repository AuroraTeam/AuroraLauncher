import {
    AUTH_METHOD,
    AUTH_TYPE_METHOD,
    AuthRequestData,
    AuthResponseData,
    AuthTypeResponseData,
    HttpHelper,
    LAUNCHER_METHOD,
    LauncherResponse,
    PROFILE_METHOD,
    ProfileRequestData,
    ProfileResponseData,
    SERVERS_METHOD,
    ServersResponseData,
    UpdatesRequestData,
    UpdatesResponseData,
    VERIFY_METHOD,
    VerifyRequestData,
    VerifyResponseData,
} from "@aurora-launcher/core";

export class AuroraAPI {
    constructor(private baseUrl: string) {}

    launcherRequest() {
        return HttpHelper.getResourceFromJson<LauncherResponse>(new URL(LAUNCHER_METHOD, this.baseUrl));
    }

    authTypeRequest() {
        return HttpHelper.getResourceFromJson<AuthTypeResponseData>(new URL(AUTH_TYPE_METHOD, this.baseUrl));
    }

    authRequest(data: AuthRequestData) {
        return HttpHelper.postJson<AuthResponseData>(new URL(AUTH_METHOD, this.baseUrl), data);
    }

    serversRequest() {
        return HttpHelper.getResourceFromJson<ServersResponseData>(new URL(SERVERS_METHOD, this.baseUrl));
    }

    profileRequest(data: ProfileRequestData) {
        return HttpHelper.postJson<ProfileResponseData>(new URL(PROFILE_METHOD, this.baseUrl), data);
    }

    updateRequest(data: UpdatesRequestData) {
        return HttpHelper.postJson<UpdatesResponseData>(new URL(VERIFY_METHOD, this.baseUrl), data);
    }

    verifyRequest(data: VerifyRequestData) {
        return HttpHelper.postJson<VerifyResponseData>(new URL(VERIFY_METHOD, this.baseUrl), data);
    }
}
