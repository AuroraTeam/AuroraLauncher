import { WebRequest } from "../WebRequest";
import { WebResponse } from "../WebResponse";

export abstract class AbstractRequest {
    abstract readonly url: RegExp;
    abstract readonly method: string;

    abstract emit(req: WebRequest, res: WebResponse): PromiseOr<void>;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    protected isInvalidValue(param: any): boolean {
        return typeof param !== "string" || param.trim().length === 0;
    }
}
