import { sep } from "path";

import { Service } from "@freshgum/typedi";
import { StorageHelper } from "@root/helpers";

import { ClientsManager } from "../clients/ClientsManager";
import { ProfilesManager } from "../profiles/ProfilesManager";
import { WatchService } from "./WatchService";

@Service([ProfilesManager, ClientsManager])
export class Watcher {
    #clientsWatcher = new WatchService();
    #profilesWatcher = new WatchService();
    private stopped = false;
    private subscriptionPromise?: Promise<void>;

    constructor(
        private readonly profilesManager: ProfilesManager,
        private readonly clientsManager: ClientsManager,
    ) {}

    subscription(): Promise<void> {
        if (this.stopped) return Promise.resolve();
        return (this.subscriptionPromise ??= this.subscribeWatchers().finally(() => {
            this.subscriptionPromise = undefined;
        }));
    }

    private async subscribeWatchers(): Promise<void> {
        await this.#clientsWatcher.subscribe(
            StorageHelper.clientsDir,
            StorageHelper.clientsDir,
            (path) => {
                const dir = path.split(sep);
                return this.clientsManager.hashClients(dir[0]);
            },
        );
        await this.#profilesWatcher.subscribe(StorageHelper.profilesDir, ".", () =>
            this.profilesManager.reloadProfiles(),
        );
    }

    async closeWatcher() {
        const results = await Promise.allSettled([
            this.#clientsWatcher.unsubscribe(),
            this.#profilesWatcher.unsubscribe(),
        ]);
        const errors = results.flatMap((result) =>
            result.status === "rejected" ? [result.reason] : [],
        );
        if (errors.length > 0)
            throw new AggregateError(errors, "Failed to close Watcher subscriptions");
    }

    async stop(): Promise<void> {
        this.stopped = true;
        await this.subscriptionPromise?.catch(() => {});
        await this.closeWatcher();
    }
}
