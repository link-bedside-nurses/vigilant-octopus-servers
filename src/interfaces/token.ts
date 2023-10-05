import { Types } from 'mongoose'

export interface IToken extends NonNullable<unknown> {
    id: Types.ObjectId
    expiresIn: number
}