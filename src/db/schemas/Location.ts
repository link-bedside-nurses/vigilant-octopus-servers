import { modelOptions, Severity, prop } from '@typegoose/typegoose'

@modelOptions( { schemaOptions: { _id: false, versionKey: false }, options: { allowMixed: Severity.ALLOW } } )
export class Location {
	@prop( { type: String, default: 'Point', enum: ['Point'] } )
	type?: string

	@prop( { type: [Number] } )
	coordinates!: number[]
}
