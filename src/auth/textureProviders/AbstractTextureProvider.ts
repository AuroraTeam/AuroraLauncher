import { AbstractProvider } from "../AbstractProvider"
import { VoidTextureProvider } from "./VoidTextureProvider"
export abstract class AbstractTextureProvider extends AbstractProvider {
    public static getDefaultConfig(): AbstractTextureProviderConfig {
        return {
            type: VoidTextureProvider.getType(),
        }
    }
}

export interface AbstractTextureProviderConfig {
    type: string
}
