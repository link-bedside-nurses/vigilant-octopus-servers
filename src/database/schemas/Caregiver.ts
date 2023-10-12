import {Severity, modelOptions, pre, prop} from "@typegoose/typegoose";
import argon from "argon2";
import phoneRegex from "@/constants/phone-regex";

export enum VerificationStatusEnum {
  PROCESSING = "PROCESSING",
  FAILED = "FAILED",
  REJECTED = "REJECTED",
  VERIFIED = "VERIFIED",
  PENDING = "PENDING"
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
@pre<Caregiver>("save", async function (next) {
  // Hash password before save
  if (!this.isModified("password") && this.password) next();
  this.password = await argon.hash(this.password || "", { saltLength: 10 });
})
export class Caregiver {
  @prop({ type: String })
  password!: string;

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

  @prop({ type: Number })
  otp?: number;

  @prop({ type: String, required: false, default: "" })
  verificationCode?: string;

  @prop({ type: String, required: false, default: "" })
  passwordResetToken?: string;

  @prop({ type: Date, required: false })
  passwordResetTokenExpiration?: Date;

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

  @prop({ type: { String }, required: false, default: "" })
  location?: string;

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
