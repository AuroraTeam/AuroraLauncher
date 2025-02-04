export interface SkinableAuthProvider {
    getSkinData(userResolvable: string): Promise<MojangTextures["textures"]>;
}

export interface MojangTextures {
    textures: {
        SKIN?: {
            url: string;
            metadata?: {
                model?: string;
            };
        };
        CAPE?: {
            url: string;
        };
    };
}
