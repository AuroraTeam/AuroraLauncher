export interface MojangAssets {
    /**
     * Найдено в https://launchermeta.mojang.com/v1/packages/3d8e55480977e32acd9844e545177e69a52f594b/pre-1.6.json \
     * до версии 1.6 (если точнее до снапшота 13w23b)
     */
    map_to_resources?: boolean;
    /**
     * Найдено в https://launchermeta.mojang.com/v1/packages/770572e819335b6c0a053f8378ad88eda189fc14/legacy.json \
     * начиная с версии версии 1.6 (если точнее с снапшота 13w24a) и до 1.7.2 (13w48b)
     */
    virtual?: boolean;
    objects: { [key: string]: MojangAsset };
}

export interface MojangAsset {
    hash: string;
    size: number;
}
