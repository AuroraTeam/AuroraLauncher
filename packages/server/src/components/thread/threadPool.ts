import { Worker as NativeWorker } from 'worker_threads';
import { AsyncQueue } from "@root/components/thread/asyncQueue";
import { Task } from "@root/components/thread/utils/types";

export class ThreadPool {
    private threads: NativeWorker[] = [];
    private asyncQueue: AsyncQueue;

    constructor(numOfThreads: number) {
        for (let i = 0; i < numOfThreads; i++) {
            const thread = new NativeWorker('./utils/worker.js');
            this.threads.push(thread);
            this.initializeThread(thread);
        }

        this.asyncQueue = new AsyncQueue(this.threads)
    }

    async runTask<T>(task: Task<T>) {
        return this.asyncQueue.addTask(task);
    }

    private initializeThread(worker: NativeWorker) {
        worker.on('message', (result) => {
            if ('taskId' in result) {
                this.asyncQueue.resolve(result.taskId, result.data);
            }
        });

        worker.on('error', (error) => {
            console.error('Worker error:', error);
        });
    }
}
