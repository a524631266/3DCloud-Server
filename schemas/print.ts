import * as mongoose from "mongoose";
import { Schema, Types } from "mongoose";

export interface IPrint extends mongoose.Document {
    _id: Types.ObjectId;
    file_id: string;
    file_name: string;
    printer_id: string;
    printer_name: string;
    host_id: string;
    created: Date;
    started: Date;
    status: string;
    description: string;
    timestamp: number;
}

export const PrintSchema = new Schema({
    _id: { required: true, type: Schema.Types.ObjectId, auto: true },
    file_id: { required: true, type: String },
    file_name: { required: true, type: String },
    printer_id: { required: true, type: String },
    printer_name: { required: true, type: String },
    host_id: { required: false, type: String },
    created: { required: true, type: Date },
    started: { required: false, type: Date },
    status: { required: true, type: String },
    description: { required: false, type: String },
    timestamp: { required: true, type: Number }
});

const Print = mongoose.model<IPrint>("Print", PrintSchema, "prints");

export default Print;
