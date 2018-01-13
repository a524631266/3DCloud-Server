import * as express from "express";
import { Manager } from "./manager";

export class ApiEndpoint {
    public constructor(
        private route: string,
        private method: string,
        private handler: (manager: Manager, req: express.Request, res: express.Response) => void
    ) { }

    public getRoute(): string {
        return this.route;
    }

    public getMethod(): string {
        return this.method;
    }

    public trigger(manager: Manager, req: express.Request, res: express.Response): void {
        this.handler(manager, req, res);
    }
}