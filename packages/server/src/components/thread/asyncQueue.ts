import { Worker as NativeWorker } from "worker_threads";

import { Task } from "@root/components/thread/utils/types";

export class AsyncQueue {
    private taskHelper: TaskHelper = new TaskHelper();
    private threads: NativeWorker[] = [];
    private nextThreadIndex = 0;

    constructor(threads: NativeWorker[]) {
        this.threads = threads;
    }

    public enqueueTask<T>(task: Task<T>) {
        return new Promise( (resolve) => {
            this.taskHelper.addTask(task, resolve);

            this.processTasks();
        });
    }

    private async processTasks() {
        while (this.taskHelper.hasTasks()) {
            const { taskId, task } = this.taskHelper.getNextTask();
            const thread = this.getAvailableThread();

            if (thread) {
                thread.postMessage({ type: "task", taskId, task });
            }
        }
    }

    public resolve(taskId: number, data: any) {
        const resolver = this.taskHelper.getResolver(taskId);
        if (resolver) {
            resolver(data);
            this.taskHelper.removeTask(taskId);

            if (this.taskHelper.hasTasks()) {
                this.processTasks();
            }
        }
    }

    private getAvailableThread() {
        const thread = this.threads[this.nextThreadIndex];
        this.nextThreadIndex = (this.nextThreadIndex + 1) % this.threads.length;
        return thread;
    }
}

class TaskHelper {
    private tasks: { taskId: number; task: Task<any>; resolver: (value: any) => void }[] = [];
    private taskIdCounter = 0;

    public getNewTaskId(): number {
        return this.taskIdCounter++;
    }

    public addTask<T>(task: Task<T>, resolver: (value: any) => void) {
        const taskId: number = this.getNewTaskId();
        this.tasks.push({ taskId, task, resolver });
    }

    public hasTasks(): boolean {
        return this.tasks.length > 0;
    }

    public getNextTask() {
        return this.tasks.shift()!;
    }

    public getResolver(taskId: number) {
        const task = this.tasks.find((t) => t.taskId === taskId);
        return task ? task.resolver : undefined;
    }

    public removeTask(taskId: number) {
        this.tasks = this.tasks.filter((t) => t.taskId !== taskId);
    }
}
