import { Worker } from "node:worker_threads"
import { singleton } from "tsyringe";

@singleton()
export class ThreadPool {
    private workers: Worker[] = [];
    private freeWorkers: Worker[] = [];
    private taskQueue: ((worker: Worker) => void)[] = [];

    constructor() {
        for (let i = 0; i < 4; i++) {
            const worker = (() => {
                return new Worker("./worker.js");
            })();

            this.workers.push(worker);
            this.freeWorkers.push(worker);
        }
    }

    runTask<T>(task: string): Promise<T> {
        return new Promise((resolve, reject) => {
            const worker = this.freeWorkers.pop();

            if (worker) {
                this.runTaskOnWorker(worker, task, resolve, reject);
            } else {
                this.taskQueue.push((worker) => this.runTaskOnWorker(worker, task, resolve, reject));
            }
        });
    }

    private runTaskOnWorker<T>(worker: Worker, task: string, resolve: (value: T) => void, reject: (reason?: any) => void) {
        worker.once('message', (result) => {
            this.freeWorkers.push(worker);
            resolve(result);
            this.runQueuedTask();
        });
        worker.once('error', (error) => {
            this.freeWorkers.push(worker);
            reject(error);
            this.runQueuedTask();
        });

        worker.postMessage(task);
    }

    private runQueuedTask() {
        const queuedTask = this.taskQueue.shift();
        if (queuedTask) {
            const worker = this.freeWorkers.pop();
            if (worker) {
                queuedTask(worker);
            } else {
                this.taskQueue.unshift(queuedTask);
            }
        }
    }
}
