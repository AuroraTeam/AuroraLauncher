import { LauncherServer } from '../LauncherServer';

export class ModulesManager extends NodeJS.EventEmitter {
    ls: LauncherServer

    constructor(ls: LauncherServer) {
        super()
        this.ls = ls
        this.loadModules()
    }

    private loadModules(): void {

    }
}