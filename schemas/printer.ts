import * as mongoose from "mongoose";
import { Schema } from "mongoose";

export interface IPrinter extends mongoose.Document {
    _id: string;
    name: string;
    type: string;
}

export const PrinterSchema = new Schema({
    _id: { required: true, type: String, auto: false },
    name: { required: true, type: String },
    type: { required: true, type: String }
});

const Printer = mongoose.model<IPrinter>("Printer", PrinterSchema, "printers");

export default Printer;
