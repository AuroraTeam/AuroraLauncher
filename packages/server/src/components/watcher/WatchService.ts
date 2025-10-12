import { LogHelper } from "@root/helpers";
import { FSWatcher, watch } from "chokidar";

export class WatchService {
    #watcherInstance!: FSWatcher;
    #timer!: NodeJS.Timeout;

    subscribe(dir: string, cwd: string, reload: (path: string) => void) {
        this.#watcherInstance = watch(dir, { ignoreInitial: true, cwd }).on(
            "all",
            (event, path) => {
                if (this.#timer) clearTimeout(this.#timer);
                this.#timer = setTimeout(() => reload(path), 3000);
                LogHelper.debug(event, path);
            },
        );
    }

    async unsubscribe() {
        await this.#watcherInstance.close();
    }
}
