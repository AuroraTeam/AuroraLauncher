export interface ProfileServerConfig {
    ip: string;
    port: string;
    title: string;

    // Whitelist
    whiteListType: "null" | "users" | "uuids" | "permissions";
    whiteListPermisson?: number; // permission в виде битового флага (пока только как возможный вариант)
    whiteListUUIDs?: string[]; // Список игроков по uuid
    hideProfile?: boolean;
    message?: string;
}

// export interface ProfileOptional {
//     id: number
//     name: string
//     description: string
//     mark: boolean
//     filename: string
//     conflict: number[]
//     children: ProfileOptional[]
// }
