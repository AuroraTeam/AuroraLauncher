export interface SkinableAuthProvider {
    getSkinData(userResolvable: string): Promise<MojangTextures["textures"]>;
}

export interface MojangTextures {
    textures: {
        SKIN?: {
            url: string;
            metadata?: {
                model?: "slim";
            };
        };
        CAPE?: {
            url: string;
        };
    };
}
