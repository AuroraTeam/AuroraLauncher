import { sep } from "path";
import { Service } from "typedi";
import { FSWatcher, watch } from 'chokidar';
import { LogHelper, StorageHelper } from "@root/utils";
import { ProfilesManager } from "../profiles/ProfilesManager";
import { ClientsManager } from "../clients/ClientsManager";

@Service()
export class Watcher {
    #prcess1:FSWatcher
    #prcess2:FSWatcher

    constructor(private readonly profilesManager:ProfilesManager, private readonly clientsManager:ClientsManager) {
        this.subscription();
    }

    async subscription() {

        this.#prcess1 = watch(StorageHelper.clientsDir, {ignoreInitial: true, cwd: './dist/gameFiles/clients'})
            .on('all', (event, path) => this.reloadClient(event, path));

        this.#prcess2 = watch(StorageHelper.profilesDir, {ignoreInitial: true, cwd: '.'})
            .on('all', (event, path) => this.reloadProfile(event, path));
    }

    async closeWatcher() {
        await this.#prcess1.close()
        await this.#prcess2.close()
    }

    private async reloadClient(event:string, path:string) {
        LogHelper.debug(event, path);
        const dir = path.split(sep);
        this.clientsManager.hashClients(dir[0]);
    }

    private async reloadProfile(event:string, path:string) {
        LogHelper.debug(event, path);
        this.profilesManager.reloadProfiles();
    }
}