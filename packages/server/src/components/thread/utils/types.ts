export type Task<T> = () => Promise<T>;

export type Message = { type: "task"; task: Task<any> } | { type: "terminate" };
