import { sep } from "path";

import { StorageHelper } from "@root/utils";
import { Service } from "typedi";

import { ClientsManager } from "../clients/ClientsManager";
import { ProfilesManager } from "../profiles/ProfilesManager";
import { WatchService } from "./WatchService";

@Service()
export class Watcher {
    #clientsWatcher = new WatchService();
    #profilesWatcher = new WatchService();

    constructor(
        private readonly profilesManager: ProfilesManager,
        private readonly clientsManager: ClientsManager,
    ) {
        this.subscription();
    }

    subscription() {
        this.#clientsWatcher.subscribe(
            StorageHelper.clientsDir,
            StorageHelper.clientsDir,
            (path) => {
                const dir = path.split(sep);
                this.clientsManager.hashClients(dir[0]);
            },
        );
        this.#profilesWatcher.subscribe(StorageHelper.profilesDir, ".", () =>
            this.profilesManager.reloadProfiles(),
        );
    }

    async closeWatcher() {
        await this.#clientsWatcher.unsubscribe();
        await this.#profilesWatcher.unsubscribe();
    }
}
