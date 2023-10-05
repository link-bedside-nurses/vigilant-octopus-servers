import { Severity, modelOptions, pre, prop } from "@typegoose/typegoose";
import argon from "argon2";

export enum VerificationStatusEnum {
  PROCESSING = "PROCESSING",
  FAILED = "FAILED",
  REJECTED = "REJECTED",
  VERIFIED = "VERIFIED",
  PENDING="PENDING"
}

@modelOptions({ schemaOptions: { _id: false, versionKey: false } })
class Avatar {
  @prop({ type: String })
  url!: string;

  @prop({ type: String })
  publicId!: string;
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
  if (!this.isModified("password") && Caregiver.prototype.password) next();
  Caregiver.prototype.password = await argon.hash(Caregiver.prototype.password || "", { saltLength: 10 });
})
export class Caregiver {
  @prop({ type: String, required: true, unique: true })
  email!: string;

  @prop({ type: String })
  password!: string;

  @prop({ type: String })
  phone!: string;

  @prop({ type: String })
  firstname!: string;

  @prop({ type: String })
  lastname!: string;

  @prop({ type: Date })
  dateOfBirth?: Date;

  @prop({ type: () => Avatar })
  avatar?: Avatar;

  @prop({ type: Boolean, default: false })
  isEmailVerified?: boolean;

  @prop({type:Number})
  otp?:number

  @prop({ type: String , required:false, default:""})
  verificationCode?: string;

  @prop({ type: String, required:false, default:"" })
  passwordResetToken?: string;

  @prop({ type: Date, required: false })
  passwordResetTokenExpiration?: Date;

  @prop({ type: String, required:false, default:"" })
  nin?: string;

  @prop({ type: String ,required:false,default:""})
  medicalLicenseNumber?: string;

  @prop({type:String, required:false, default:""})
  workExperience?:string

  @prop({type:String, required:false,default:""})
  about?:string

  @prop({type:String,required:false, default:""})
  rating?:string

  @prop({type:String, required:false, default:""})
  placeOfReception?:string

  @prop({type:String,required:false, default:""})
  speciality?:string
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
