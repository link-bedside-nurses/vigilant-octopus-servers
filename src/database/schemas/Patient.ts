import { modelOptions, prop, Severity } from "@typegoose/typegoose";
import phoneRegex from "@/constants/phone-regex";
import { Location } from "@/database/schemas/Location";

@modelOptions({
  schemaOptions: {
    id: true,
    virtuals: true,
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform(_doc, ret): void {
        delete ret.password;
        delete ret.__v;
      },
    },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class Patient {
  @prop({
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v: string) {
        return phoneRegex.test(v);
      },
      message: "Invalid Phone Format!",
    },
  })
  phone!: string;

  @prop({ type: String, required: true, minlength: 3, maxlength: 250 })
  firstName!: string;

  @prop({ type: String, required: true, minlength: 3, maxlength: 250 })
  lastName!: string;

  @prop({
    type: Location,
    required: false,
    ref: "Location",
    default: {
      lng: 0,
      lat: 0,
    },
  })
  location?: { lng: number; lat: number };

  @prop({ type: String, required: false, default: "00000" })
  otp?: string;
}
