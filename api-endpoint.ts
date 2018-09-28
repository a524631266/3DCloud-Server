import { Request, Response } from "express";

export class ApiEndpoint {
    public constructor(
        private route: string,
        private method: string,
        private handler: (req: Request, res: Response) => void
    ) { }

    public getRoute(): string {
        return this.route;
    }

    public getMethod(): string {
        return this.method;
    }

    public trigger(req: Request, res: Response): void {
        this.handler(req, res);
    }
}
