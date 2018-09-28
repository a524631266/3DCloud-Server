import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import { Socket } from "../socket";
import { IDevice } from "./device";
import { IPrinterType } from "./printer-type";

export interface IPrinter extends mongoose.Document {
    _id: string;
    name: string;
    device: IDevice;
    type: IPrinterType;
}

export const PrinterSchema = new Schema({
    "_id": {"required": true, "type": String, "auto": false},
    "name": {"required": true, "type": String},
    "device": {"required": true, "type": String, "ref": "Device"},
    "type": {"required": true, "type": Schema.Types.ObjectId, "ref": "PrinterType"}
});

PrinterSchema.post("save", (device) => {
    Socket.documentSaved("Printer", device);
});

PrinterSchema.post("findOneAndUpdate", (device) => {
    Socket.documentSaved("Printer", device);
});

PrinterSchema.post("remove", (device) => {
    Socket.documentRemoved("Printer", device);
});

PrinterSchema.post("findOneAndRemove", (device) => {
    Socket.documentRemoved("Printer", device);
});

const Printer = mongoose.model<IPrinter>("Printer", PrinterSchema, "printers");

export default Printer;
