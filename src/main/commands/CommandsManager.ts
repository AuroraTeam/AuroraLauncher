import { LauncherServer } from '../LauncherServer';

export class CommandsManager {
    ls: LauncherServer

    constructor(ls: LauncherServer) {
        this.ls = ls
    }
}