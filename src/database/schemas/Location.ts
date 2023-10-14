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
  @prop({ type: String, required: true })
  lat!: string;

  @prop({ type: String, required: true })
  lng!: string;
}
