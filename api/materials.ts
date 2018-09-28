import { Request, Response } from "express";
import { ApiEndpoint } from "../api-endpoint";
import { ApiEndpointCollection } from "../api-endpoint-collection";
import { DB } from "../db";

export class MaterialsEndpointCollection extends ApiEndpointCollection {
    public getEndpoints(): ApiEndpoint[] {
        return [
            new ApiEndpoint("/materials", "GET", this.getMaterials),
            new ApiEndpoint("/materials/new", "POST", this.addMaterial),
            new ApiEndpoint("/materials/:id", "GET", this.getMaterial),
            new ApiEndpoint("/materials/:id", "POST", this.updateMaterial),
            new ApiEndpoint("/materials/:id", "DELETE", this.deleteMaterial),
            new ApiEndpoint("/materials/:id/variants", "POST", this.addMaterialVariant)
        ];
    }

    private async getMaterials(req: Request, res: Response): Promise<void> {
        try {
            res.success(await DB.getMaterials());
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async addMaterial(req: Request, res: Response): Promise<void> {
        try {
            res.success(await DB.addMaterial(
                req.body.name,
                req.body.brand,
                req.body.variants
            ));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async addMaterialVariant(req: Request, res: Response): Promise<void> {
        try {
            res.success(await DB.addMaterialVariant(req.params.id, req.body.name, req.body.color));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async getMaterial(req: Request, res: Response): Promise<void> {
        try {
            res.success(await DB.getMaterial(req.params.id));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async updateMaterial(req: Request, res: Response): Promise<void> {
        try {
            res.success(await DB.updateMaterial(req.params.id, req.body.name, req.body.brand, req.body.variants));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async deleteMaterial(req: Request, res: Response): Promise<void> {
        try {
            res.success(await DB.deleteMaterial(req.params.id));
        } catch (ex) {
            res.exception(ex);
        }
    }
}
