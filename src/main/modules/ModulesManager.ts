import { LauncherServer } from "../LauncherServer"
import { EventEmitter } from "events"

export class ModulesManager extends EventEmitter {
    ls: LauncherServer

    constructor(ls: LauncherServer) {
        super()
        this.ls = ls
    }
}

export declare interface ModulesManager {
    on(event: "postInit", listener: Function): this
    once(event: "postInit", listener: Function): this
    addListener(event: "postInit", listener: Function): this
    removeListener(event: "postInit", listener: Function): this
    emit(event: "postInit"): boolean

    on(event: "close", listener: Function): this
    once(event: "close", listener: Function): this
    addListener(event: "close", listener: Function): this
    removeListener(event: "close", listener: Function): this
    emit(event: "close"): boolean
}
