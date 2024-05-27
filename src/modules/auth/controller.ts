import { HTTPRequest } from "../../adapters/express-callback";
import { StatusCodes } from "http-status-codes";
import { db } from "../../db";
import { createAccessToken } from "../../services/token/token";
import { Document } from "mongoose";
import { ACCOUNT } from "../../interfaces";
import * as argon2 from "argon2";
import { DESIGNATION } from "../../interfaces/designations";

interface SignUpBody {
    phone: string;
    name: string;
    password: string;
    email: string;
}

export function patientSignup() {
    return async function (
        request: HTTPRequest<object, Omit<SignUpBody, "email">>,
    ) {
        const { phone, name } = request.body;

        const missingFields = [];

        if (!phone) {
            missingFields.push("phone");
        }

        if (!name) {
            missingFields.push("name");
        }

        if (missingFields.length > 0) {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                body: {
                    message: `The following fields are missing: ${missingFields.join(
                        ", ",
                    )}`,
                    data: null,
                },
            };
        }

        const patient = await db.patients.findOne({ phone });

        if (patient) {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                body: {
                    message: "Phone number in use",
                    data: null,
                },
            };
        }

        const user = await db.patients.create({
            phone,
            name,
            designation: DESIGNATION.PATIENT,
        });

        await user.save();

        return {
            statusCode: StatusCodes.OK,
            body: {
                data: user,
                message: "Account created",
            },
        };
    };
}

export function caregiverSignup() {
    return async function (request: HTTPRequest<object, SignUpBody>) {
        const { phone, password, name } = request.body;

        if (!phone || !password || !name) {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                body: {
                    message: "Some fields are missing",
                    data: null,
                },
            };
        }

        const caregiver = await db.caregivers.findOne({ phone });

        if (caregiver) {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                body: {
                    message: "Phone number in use",
                    data: null,
                },
            };
        }

        const hash = await argon2.hash(password, {
            type: argon2.argon2id,
        });
        const user = await db.caregivers.create({
            phone,
            name,
            designation: DESIGNATION.NURSE,
            password: hash,
        });

        await user.save();

        const accessToken = createAccessToken(user as Document & ACCOUNT);

        return {
            statusCode: StatusCodes.OK,
            body: {
                data: user,
                accessToken,
                message: "Account created",
            },
        };
    };
}

export function adminSignup() {
    return async function (
        request: HTTPRequest<
            object,
            {
                email: string;
                firstName: string;
                lastName: string;
                password: string;
            }
        >,
    ) {
        const { email, password, firstName, lastName } = request.body;

        console.log("boddddy::1", request.body);
        if (!email || !password || !firstName || !lastName) {
            console.log("boddddy::2", request.body);
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                body: {
                    message: "Some fields are missing",
                    data: null,
                },
            };
        }
        console.log("boddddy::3", request.body);

        const user = await db.admins.findOne({ email });

        if (user) {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                body: {
                    message: "email in use",
                    data: null,
                },
            };
        }

        const hash = await argon2.hash(password, {
            type: argon2.argon2id,
        });
        const newUser = await db.admins.create({
            email,
            firstName,
            lastName,
            designation: DESIGNATION.ADMIN,
            password: hash,
        });

        await newUser.save();

        const token = createAccessToken(newUser as Document & ACCOUNT);

        return {
            statusCode: StatusCodes.OK,
            body: {
                data: newUser,
                token,
                message: "Account created",
            },
        };
    };
}

export function patientSignin() {
    return async function (
        request: HTTPRequest<
            object,
            {
                phone: string;
            }
        >,
    ) {
        const { phone } = request.body;

        if (!request.body.phone) {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                body: {
                    message: "Phone must be specified!",
                    data: null,
                },
            };
        }

        const user = await db.patients.findOne({ phone });

        if (!user) {
            return {
                statusCode: StatusCodes.UNAUTHORIZED,
                body: {
                    message: "No such user found",
                    data: null,
                },
            };
        }

        return {
            statusCode: StatusCodes.OK,
            body: {
                data: null,
                message: "Success",
            },
        };
    };
}

export function caregiverSignin() {
    return async function (
        request: HTTPRequest<object, { phone: string; password: string }>,
    ) {
        const { phone, password } = request.body;

        if (!phone || !password) {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                body: {
                    message: "Some fields are missing",
                    data: null,
                },
            };
        }

        const user = await db.caregivers.findOne({ phone });

        if (!user) {
            return {
                statusCode: StatusCodes.UNAUTHORIZED,
                body: {
                    message: "Invalid Credentials",
                    data: null,
                },
            };
        }

        const match = await argon2.verify(user.password, password, {
            type: argon2.argon2id,
        });

        if (!match) {
            return {
                statusCode: StatusCodes.UNAUTHORIZED,
                body: {
                    data: null,
                    message: "Invalid Credentials",
                },
            };
        }

        const accessToken = createAccessToken(user as Document & ACCOUNT);

        return {
            statusCode: StatusCodes.OK,
            body: {
                data: user,
                accessToken,
                message: "Signed in",
            },
        };
    };
}

export function adminSignin() {
    return async function (
        request: HTTPRequest<object, { email: string; password: string }>,
    ) {
        const { email, password } = request.body;

        if (!email || !password) {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                body: {
                    message: "Some fields are missing",
                    data: null,
                },
            };
        }

        const user = await db.admins.findOne({ email });

        if (!user) {
            return {
                statusCode: StatusCodes.UNAUTHORIZED,
                body: {
                    message: "Invalid Credentials",
                    data: null,
                },
            };
        }

        const match = await argon2.verify(user.password, password, {
            type: argon2.argon2id,
        });

        if (!match) {
            return {
                statusCode: StatusCodes.UNAUTHORIZED,
                body: {
                    data: null,
                    message: "Invalid Credentials",
                },
            };
        }

        const accessToken = createAccessToken(user as Document & ACCOUNT);

        return {
            statusCode: StatusCodes.OK,
            body: {
                data: user,
                accessToken,
                message: "Signed in",
            },
        };
    };
}

export function deleteAccount() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return async function (_: HTTPRequest<object, object, object>) {
        return {
            statusCode: StatusCodes.OK,
            body: {
                data: null,
                message: "account deleted",
            },
        };
    };
}

export function getAccessToken() {
    return async function (
        request: HTTPRequest<object, object, { designation: DESIGNATION }>,
    ) {
        const designation = request.query.designation;

        if (!designation) {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                body: {
                    message: "Designation must be specified",
                    data: null,
                },
            };
        }

        let user;
        if (designation === DESIGNATION.PATIENT) {
            user = await db.patients.findById(request.account?.id);
        } else if (designation === DESIGNATION.NURSE) {
            user = await db.caregivers.findById(request.account?.id);
        } else if (designation === DESIGNATION.ADMIN) {
            user = await db.caregivers.findById(request.account?.id);
        } else {
            return {
                statusCode: StatusCodes.UNAUTHORIZED,
                body: {
                    message: "Invalid Designation",
                    data: null,
                },
            };
        }

        if (!user) {
            return {
                statusCode: StatusCodes.BAD_REQUEST,
                body: {
                    data: user,
                    message: "No user found",
                },
            };
        }

        const accessToken = createAccessToken(user as Document & ACCOUNT);

        return {
            statusCode: StatusCodes.OK,
            body: {
                data: null,
                accessToken,
                message: "Access token has been reset!",
            },
        };
    };
}
