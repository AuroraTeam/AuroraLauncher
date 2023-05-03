export interface ClientArgs {
    // Auth params
    username: string;
    userUUID: string;
    accessToken: string;

    // Client
    version: string;
    clientDir: string;

    // Assets
    assetsIndex: string;
    assetsDir: string;

    // Launch client
    mainClass: string;
    classPath: string[];
    jvmArgs: string[];
    clientArgs: string[];
}
