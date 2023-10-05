import jwt from "jsonwebtoken"
import EnvVars from "@/constants/env-vars";
import {Document} from "mongoose";

interface IToken{
    id:string;
    phone:string;
}

export function createToken(user: (Document & { phone: string }) | null): string {
    return jwt.sign(
        {
            id:user?.id,
            phone: user?.phone,
        },
        EnvVars.getAccessTokenSecret() as jwt.Secret
    ) as string
}

export async function verifyToken(token: string) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, EnvVars.getAccessTokenSecret() as jwt.Secret, (err, payload) => {
            if (err) reject(err)

            resolve(payload as IToken)
        })
    })
}