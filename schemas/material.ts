import * as mongoose from "mongoose";
import { Document, Schema } from "mongoose";

export interface IColor {
    red: number;
    green: number;
    blue: number;
}

export interface IMaterialVariant {
    name: string;
    color: IColor;
}

export interface IMaterial extends Document {
    _id: string;
    name: string;
    brand: string;
    variants: IMaterialVariant[];
}

export const ColorSchema = new Schema({
    red: {required: true, type: Number},
    green: {required: true, type: Number},
    blue: {required: true, type: Number}
}, {_id: false});

export const MaterialVariantSchema = new Schema({
    name: {required: true, type: String},
    color: {required: true, type: ColorSchema}
});

export const MaterialSchema = new Schema({
    _id: {required: true, type: Schema.Types.ObjectId, auto: true},
    name: {required: true, type: String},
    brand: {required: true, type: String},
    variants: {
        required: true,
        type: [MaterialVariantSchema],
        default: [{name: "Generic", color: {red: 255, green: 255, blue: 255}}]
    }
});

export const Material = mongoose.model<IMaterial>("Material", MaterialSchema, "materials");
