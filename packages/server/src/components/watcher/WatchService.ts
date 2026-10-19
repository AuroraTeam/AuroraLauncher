import { LogHelper } from "@root/helpers";
import { FSWatcher, watch } from "chokidar";

export class WatchService {
    #watcherInstance?: FSWatcher;
    #timer?: NodeJS.Timeout;

    async subscribe(
        dir: string,
        cwd: string,
        reload: (path: string) => void | Promise<void>,
    ): Promise<void> {
        if (this.#watcherInstance) return;

        this.#watcherInstance = watch(dir, { ignoreInitial: true, cwd }).on(
            "all",
            (event, path) => {
                if (this.#timer) clearTimeout(this.#timer);
                this.#timer = setTimeout(() => {
                    Promise.resolve()
                        .then(() => reload(path))
                        .catch((error: unknown) => LogHelper.error(error));
                }, 3000);
                LogHelper.debug(event, path);
            },
        );

        await new Promise<void>((resolve, reject) => {
            this.#watcherInstance!.once("ready", resolve);
            this.#watcherInstance!.on("error", (error) => {
                LogHelper.error(error);
                reject(error);
            });
        });
    }

    async unsubscribe() {
        if (this.#timer) clearTimeout(this.#timer);
        this.#timer = undefined;
        const watcher = this.#watcherInstance;
        this.#watcherInstance = undefined;
        await watcher?.close();
    }
}
