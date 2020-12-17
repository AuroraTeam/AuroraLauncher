import { AbstractProvider } from "./primaryProviders/AbstractProvider"
import { AcceptAuthProvider } from "./primaryProviders/AcceptAuthProvider"
import { RejectAuthProvider } from "./primaryProviders/RejectAuthProvider"

export class AuthManager {
    providers: Map<string, AbstractProvider> = new Map()

    constructor() {
        this.registerHandlers()
        this.registerHwidHandlers()
        this.registerProviders()
        this.registerTextureProviders()
    }

    registerHandlers(): void {
        return
    }

    registerHwidHandlers(): void {
        return
    }

    registerProviders(): void {
        this.registerProvider(new AcceptAuthProvider())
        this.registerProvider(new RejectAuthProvider())
        return
    }

    registerProvider(provider: AbstractProvider): void {
        this.providers.set(provider.getType(), provider)
    }

    registerTextureProviders(): void {
        return
    }
}
