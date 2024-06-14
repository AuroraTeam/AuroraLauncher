import { sep } from "path";
import { Service } from "typedi";
import { watch } from 'chokidar';
import { LogHelper, StorageHelper } from "@root/utils";
import { ProfilesManager } from "../profiles/ProfilesManager";
import { ClientsManager } from "../clients/ClientsManager";

@Service()
export class Watcher {

    constructor(private readonly profilesManager:ProfilesManager, private readonly clientsManager:ClientsManager) {
        this.subscription();
    }

    async subscription() {

        watch(StorageHelper.clientsDir, {ignoreInitial: true, cwd: './dist/gameFiles/clients'})
            .on('all', (event, path) => this.reloadClient(event, path));

        watch(StorageHelper.profilesDir, {ignoreInitial: true, cwd: '.'})
            .on('all', (event, path) => this.reloadProfile(event, path));
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