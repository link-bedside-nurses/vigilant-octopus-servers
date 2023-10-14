import { modelOptions, prop, Severity } from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    id: true,
    virtuals: true,
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class Location {
  @prop({ type: Number, required: true })
  lat!: number;

  @prop({ type: Number, required: true })
  lng!: number;

  @prop({ required: false, ref: "Caregiver", default: "" })
  caregiverId?: string;

  @prop({ required: false, ref: "Patient", default: "" })
  patientId?: string;
}
