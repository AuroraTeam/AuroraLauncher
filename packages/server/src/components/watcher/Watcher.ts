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

    constructor(
        private readonly profilesManager: ProfilesManager,
        private readonly clientsManager: ClientsManager,
    ) {}

    async subscription(): Promise<void> {
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
        await Promise.all([
            this.#clientsWatcher.unsubscribe(),
            this.#profilesWatcher.unsubscribe(),
        ]);
    }
}
