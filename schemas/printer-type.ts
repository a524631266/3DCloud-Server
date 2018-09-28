import * as mongoose from "mongoose";
import { Schema, Types } from "mongoose";
import { Socket } from "../socket";

export interface IPrinterType extends mongoose.Document {
    _id: Types.ObjectId;
    name: string;
    driver: string;
}

export const PrinterTypeSchema = new Schema({
    "_id": { "required": true, "type": Schema.Types.ObjectId, "auto": true },
    "name": { "required": true, "type": String },
    "driver": { "required": true, "type": String }
});

PrinterTypeSchema.post("save", (device) => {
    Socket.documentSaved("PrinterType", device);
});

PrinterTypeSchema.post("findOneAndUpdate", (device) => {
    Socket.documentSaved("PrinterType", device);
});

PrinterTypeSchema.post("remove", (device) => {
    Socket.documentRemoved("PrinterType", device);
});

PrinterTypeSchema.post("findOneAndRemove", (device) => {
    Socket.documentRemoved("PrinterType", device);
});

const PrinterType = mongoose.model<IPrinterType>("PrinterType", PrinterTypeSchema, "printer_types");

export default PrinterType;
