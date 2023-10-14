import { prop } from "@typegoose/typegoose";

export class Rating {
  @prop({ required: true, ref: "Caregiver" })
  caregiverId!: string;

  @prop({ required: true, ref: "Patient" })
  patientId!: string;

  @prop({ type: String, required: false })
  description?: string;

  @prop({ type: Number, required: false })
  value?: number;
}
