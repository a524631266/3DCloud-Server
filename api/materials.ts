import { Request, Response } from "express";
import { ApiEndpoint } from "../api-endpoint";
import { ApiEndpointCollection } from "../api-endpoint-collection";
import { Manager } from "../manager";

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

    private async getMaterials(manager: Manager, req: Request, res: Response): Promise<void> {
        try {
            res.success(await manager.getMaterials());
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async addMaterial(manager: Manager, req: Request, res: Response): Promise<void> {
        try {
            res.success(await manager.addMaterial(
                req.body.name,
                req.body.brand,
                req.body.variants
            ));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async addMaterialVariant(manager: Manager, req: Request, res: Response): Promise<void> {
        try {
            res.success(await manager.addMaterialVariant(req.params.id, req.body.name, req.body.color));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async getMaterial(manager: Manager, req: Request, res: Response): Promise<void> {
        try {
            res.success(await manager.getMaterial(req.params.id));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async updateMaterial(manager: Manager, req: Request, res: Response): Promise<void> {
        try {
            res.success(await manager.updateMaterial(req.params.id, req.body.name, req.body.brand, req.body.variants));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async deleteMaterial(manager: Manager, req: Request, res: Response): Promise<void> {
        try {
            res.success(await manager.deleteMaterial(req.params.id));
        } catch (ex) {
            res.exception(ex);
        }
    }
}
