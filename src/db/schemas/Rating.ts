import { Severity, modelOptions, prop, Ref, index } from '@typegoose/typegoose';
import { Caregiver } from './Caregiver';
import { Patient } from './Patient';
import mongoose from 'mongoose';

@modelOptions( {
	schemaOptions: {
		id: false,
		virtuals: true,
		timestamps: true,
		toJSON: {
			virtuals: true,
			transform( _doc, ret ): void {
				delete ret.__v;
			},
		},
	},
	options: { allowMixed: Severity.ALLOW },
} )
@index( { caregiver: "text" } )
export class Rating {
	@prop( { type: mongoose.Types.ObjectId, required: true, ref: Patient } )
	patient!: Ref<Patient>;

	@prop( { type: mongoose.Types.ObjectId, required: true, ref: Caregiver, index: true } )
	caregiver!: Ref<Caregiver>;

	@prop( { type: String, default: '' } )
	review?: string;

	@prop( { required: true, min: 1, max: 5 } )
	value!: number;
}
