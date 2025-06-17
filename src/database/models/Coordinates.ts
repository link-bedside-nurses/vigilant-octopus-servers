import { modelOptions, prop } from '@typegoose/typegoose'

@modelOptions( { schemaOptions: { _id: false, versionKey: false } } )
export class Coordinates {
	@prop( { type: Number } )
	lat!: number

	@prop( { type: Number } )
	lng!: number
}
