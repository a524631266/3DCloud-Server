import * as mongoose from "mongoose";
import {Schema} from "mongoose";
import {IPrinterType} from "./printer-type";

export interface IPrinter extends mongoose.Document {
    _id: string;
    name: string;
    type: IPrinterType;
}

export const PrinterSchema = new Schema({
    _id: { required: true, type: String, auto: false },
    name: { required: true, type: String },
    type: { required: true, type: Schema.Types.ObjectId, ref: "PrinterType" }
});

const Printer = mongoose.model<IPrinter>("Printer", PrinterSchema, "printers");

export default Printer;
