import { HTTPRequest } from "@/adapters/express-callback";
import { StatusCodes } from "http-status-codes";
import {db} from "@/database";
import {createToken} from "@/token/token";
import argon2 from "argon2";
import {Document} from "mongoose";

export function signup() {
    return async function (request: HTTPRequest<object,{ email?:string,phone:string, password:string, firstName:string, lastName:string }, { user:"patient" | "admin" | "caregiver" }>) {

        let user;
        if(request.query.user === "patient"){
           user  = await db.patients.findOne({phone:request.body.phone})
        } else if(request.query.user === "caregiver"){
           user  = await db.caregivers.findOne({phone:request.body.phone})
        } else if(request.query.user === "admin"){
           user  = await db.admins.findOne({phone:request.body.phone})
        } else{
            return {
                statusCode:StatusCodes.NOT_FOUND,
                body:{
                    message:"Please specify a role in the query object",
                    data:null
                }
            }
        }

        if(user) {
            return {
                statusCode:StatusCodes.BAD_REQUEST,
                body:{
                message:"Phone number in use",
                    data:null
                }
            }
        }

        if(user) {
            return {
                statusCode:StatusCodes.BAD_REQUEST,
                body:{
                    message:"Phone number in use",
                    data:null
                }
            }
        }

        if(request.query.user === "patient"){
            user = await db.patients.create({
                email:request.body?.email,
                phone:request.body.phone,
                password:request.body.password,
                firstName:request.body.firstName,
                lastName:request.body.lastName
            })
        }else if(request.query.user === "admin"){
            user = await db.admins.create({
                email:request.body?.email,
                phone:request.body.phone,
                password:request.body.password,
                firstName:request.body.firstName,
                lastName:request.body.lastName,
            })
        } else if(request.query.user === "caregiver") {
            user = await db.caregivers.create({
                email:request.body?.email,
                phone:request.body.phone,
                password:request.body.password,
                firstName:request.body.firstName,
                lastName:request.body.lastName
            })
        } else {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                body: {
                    data:null,
                    message:"Please specify a role in the query object"
                },
            };
        }

        await user.save()

        const token = createToken(user as Document & { phone:string })

        return {
            statusCode: StatusCodes.OK,
            body: {
                data:user,
                token,
                message:"Account created successfully"
            },
        };
    };
}

export function signin() {
    return async function (request: HTTPRequest<object,{ phone:string, password:string }, { user:"patient" | "admin" | "caregiver" }>) {

        let user;
        if(request.query.user === "patient"){
           user  = await db.patients.findOne({phone:request.body.phone})
        } else if(request.query.user === "caregiver"){
           user  = await db.caregivers.findOne({phone:request.body.phone})
        } else if(request.query.user === "admin"){
           user  = await db.admins.findOne({phone:request.body.phone})
        } else {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                body: {
                    data:null,
                    message:"Please specify a role in the query object"
                },
            };
        }

        if(!user) {
            return {
                statusCode:StatusCodes.UNAUTHORIZED,
                body:{
                    message:"Invalid Credentials",
                    data:null
                }
            }
        }

        const passwordsMatch = await argon2.verify(user.password, request.body.password)

        if(!passwordsMatch){
            return {
                statusCode: StatusCodes.UNAUTHORIZED,
                body: {
                    data:null,
                    message:"Invalid Credentials",
                },
            };
        }

        await user.save()

        const token = createToken(user as Document & { phone:string })

        return {
            statusCode: StatusCodes.BAD_REQUEST,
            body: {
                data:user,
                token,
                message:"Invalid Credentials",
            },
        };
    };
}