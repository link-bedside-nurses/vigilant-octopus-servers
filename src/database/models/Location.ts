import { modelOptions, Severity, prop } from '@typegoose/typegoose';

@modelOptions( {
	schemaOptions: { _id: false, versionKey: false },
	options: { allowMixed: Severity.ALLOW },
} )
export class Location {
	@prop( { type: String, default: 'Point', enum: ['Point'] } )
	type?: string;

	@prop( {
		type: [Number],
		validate: {
			validator: function ( coords: number[] ) {
				return coords.length === 2 &&
					coords[0] >= -180 && coords[0] <= 180 && // longitude
					coords[1] >= -90 && coords[1] <= 90;     // latitude
			},
			message: 'Invalid coordinates'
		}
	} )
	coordinates!: number[];
}
