declare type PromiseOr<T> = Promise<T> | T;

declare namespace NodeJS {
    interface Process {
        pkg?: object;
    }
}
