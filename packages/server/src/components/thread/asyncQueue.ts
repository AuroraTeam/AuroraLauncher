import { Task } from "@root/components/thread/utils/types";
import { Worker as NativeWorker } from 'worker_threads';

export class AsyncQueue {
    private tasks: Task<any>[] = [];
    private taskIDs = 0;
    private taskResolvers: Map<number, (value: any) => void> = new Map();
    private readonly threads: NativeWorker[] = [];
    private nextThreadIndex = 0;

    constructor(threads: NativeWorker[]) {
        this.threads = threads;
    }

    public addTask<T>(task: Task<T>) {
        return new Promise((resolve) => {
            const taskId = this.taskIDs++;
            this.taskResolvers.set(taskId, task);
            this.tasks.push(task)

            this.processTasks();
        })
    }

    private async processTasks() {
        while(this.tasks.length > 0) {
            const task = this.tasks.shift()
            if (task) {
                const taskId = this.taskIDs - this.tasks.length - 1;
                const thread = this.getAvailableThread();

                if (thread) {
                    thread.postMessage({ type: 'task', taskId, task });
                }
            }
        }
    }

    public resolve(taskId: number, data: any) {
        const resolver = this.taskResolvers.get(taskId);
        if (resolver) {
            resolver(data);
            this.taskResolvers.delete(taskId);

            if (this.taskResolvers.size > 0) {
                this.processTasks();
            }
        }
    }

    private getAvailableThread() {
        const thread= this.threads[this.nextThreadIndex];
        this.nextThreadIndex = (this.nextThreadIndex + 1) % this.threads.length;
        return thread;
    }
}
