import {modelOptions, pre, prop, Severity} from "@typegoose/typegoose";
import argon from "argon2";
import {validateUgandanPhoneNumber} from "@/utils/validate-phone";
import {validateEmail} from "@/utils/validate-email";
import {validateVerificationCode} from "@/utils/validate-verification-code";

@modelOptions({
  schemaOptions: {
    id: true,
    virtuals: true,
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true,
      transform(_doc, ret): void {
        delete ret.password
        delete ret.__v
      },
    },
  },
  options: { allowMixed: Severity.ALLOW },
})

@pre<Patient>("save", async function (next) {
  // Hash password before save
  if (!this.isModified("password") && Patient.prototype.password) next();
  Patient.prototype.password = await argon.hash(Patient.prototype.password || "", { saltLength: 10 });
})

export class Patient {
  @prop({ type: String, required: true, unique:true, validate:[validateUgandanPhoneNumber, "Not a valid phone UG Phone No"] })
  phone!: string;

  @prop({ type: String, required:true, minlength: 3, maxlength:250})
  firstName!: string;

  @prop({ type: String,required:true, minlength: 3, maxlength:250})
  lastName!: string;

  @prop({ type: String, required:true, minlength: 3, maxlength:250})
  password!: string;

  @prop({ type: Boolean, default: false })
  isEmailVerified?: boolean;

  @prop({ type: String, required: false, unique: true, validate:[validateEmail, "Invalid Email"] })
  email?: string;

  @prop({ type: String, validate:[validateVerificationCode,"Incorrect Verification Code"]})
  verificationCode?: string;

  @prop({ type: String })
  resetPasswordToken?: string | null;

  @prop({ type: Date, required: false })
  resetPasswordTokenExpiration?: Date | null;
}
