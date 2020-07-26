import { LauncherServer } from "../LauncherServer"

export class SocketManager {
    ls: LauncherServer

    constructor(ls: LauncherServer) {
        this.ls = ls
    }
}
