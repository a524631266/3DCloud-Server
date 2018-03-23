import * as mongoose from "mongoose";
import { Schema, Types } from "mongoose";

export interface IPrinterType extends mongoose.Document {
    _id: Types.ObjectId;
    name: string;
    driver: string;
}

export const PrinterTypeSchema = new Schema({
    _id: { required: true, type: Schema.Types.ObjectId, auto: true },
    name: { required: true, type: String },
    driver: { required: true, type: String }
});

const PrinterType = mongoose.model<IPrinterType>("PrinterType", PrinterTypeSchema, "printer_types");

export default PrinterType;
