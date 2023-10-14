import { modelOptions, prop, Severity } from "@typegoose/typegoose";
import phoneRegex from "@/constants/phone-regex";
import { Location } from "@/database/schemas/Location";

export enum VerificationStatusEnum {
  PROCESSING = "PROCESSING",
  FAILED = "FAILED",
  REJECTED = "REJECTED",
  VERIFIED = "VERIFIED",
  PENDING = "PENDING",
}

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
export class Caregiver {
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

  @prop({ type: String })
  firstname!: string;

  @prop({ type: String })
  lastname!: string;

  @prop({ type: Date })
  dateOfBirth?: Date;

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

  @prop({ type: String, required: false, default: "" })
  nin?: string;

  @prop({ type: String, required: false, default: "" })
  medicalLicenseNumber?: string;

  @prop({ type: String, required: false, default: "" })
  description?: string;

  @prop({ type: Number, required: false, default: 1 })
  rating?: number;

  @prop({ type: String, required: false, default: "" })
  placeOfReception?: string;

  @prop({ type: String, required: false, default: "" })
  speciality?: string;

  @prop({ type: () => [String] })
  languages?: string[];

  @prop({ type: () => [String] })
  affiliations?: string[];

  @prop({ type: Number, required: false, default: "" })
  experience?: number;

  @prop({ type: () => [String] })
  servicesOffered?: string[];

  @prop({ type: String, required: false, default: "" })
  imageUrl?: string;
}

// date of birth and age
// license
// verification status
// rejection reason
// registration contract details
// working experience details
// qualifications documents
// statistics on platform
// verifiedBy
