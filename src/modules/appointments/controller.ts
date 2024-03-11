/* eslint-disable @typescript-eslint/no-unused-vars */
import { HTTPRequest } from "../../adapters/express-callback";
import { StatusCodes } from "http-status-codes";
import { db } from "../../db";
import { mongoose } from "@typegoose/typegoose";
import { Appointment } from "../../db/schemas/Appointment";

export function getAllAppointments() {
    return async function (
        request: HTTPRequest<{ id: string }, object, { status: string }>,
    ) {
        // const appointments = await db.appointments
        //     .find({})
        //     .sort({ createdAt: "desc" })
        //     .populate("patient")
        //     .populate("caregiver");
        // console.log("all:", appointments);

        const { status } = request.query;

        let filters: mongoose.FilterQuery<Appointment> = {};
        if (status) {
            filters = { ...filters, status };
        }

        const queryOptions: mongoose.QueryOptions<Appointment> = {};

        const appointments = await db.appointments
            .find(
                { ...filters },
                {},
                { ...queryOptions }, // options like populating can go here
            )
            .sort({ createdAt: "desc" })
            .populate("patient")
            .populate("caregiver");

        return {
            statusCode: StatusCodes.OK,
            body: {
                data: appointments,
                message:
                    appointments.length === 0
                        ? "No Appointments Scheduled"
                        : "All appointments retrieved",
                count: appointments.length,
            },
        };
    };
}

export function getCaregiverAppointments() {
    return async function (
        request: HTTPRequest<{ id: string }, object, object>,
    ) {
        const appointments = await db.appointments
            .find({
                caregiver: {
                    _id: request.params.id,
                },
            })
            .populate("patient")
            .populate("caregiver");

        if (appointments.length > 0) {
            return {
                statusCode: StatusCodes.OK,
                body: {
                    data: appointments,
                    count: appointments.length,
                    message: "Successfully fetched caregiver Appointments",
                },
            };
        } else {
            return {
                statusCode: StatusCodes.NOT_FOUND,
                body: {
                    data: null,
                    message: "No Appointment Found",
                },
            };
        }
    };
}

export function getPatientAppointments() {
    return async function (
        request: HTTPRequest<{ id: string }, object, { status: string }>,
    ) {
        const { status } = request.query;

        const filters: mongoose.FilterQuery<Appointment> = {
            patient: {
                _id: request.params.id,
            },
            status,
        };

        const queryOptions: mongoose.QueryOptions<Appointment> = {};

        const appointments = await db.appointments
            .find(
                {
                    ...filters,
                },
                {},
                { ...queryOptions }, // options like populating can go here
            )
            .populate("patient")
            .populate("caregiver");

        if (appointments.length > 0) {
            return {
                statusCode: StatusCodes.OK,
                body: {
                    data: appointments,
                    count: appointments.length,
                    message: "Successfully fetched patient Appointments",
                },
            };
        } else {
            return {
                statusCode: StatusCodes.NOT_FOUND,
                body: {
                    data: null,
                    message: "No Appointment Found",
                },
            };
        }
    };
}

export function scheduleAppointment() {
    return async function (
        request: HTTPRequest<
            object,
            {
                title: string;
                caregiverId: string;
                description: string;
                notes: string;
            },
            object
        >,
    ) {
        if (
            !(
                request.body.title &&
                request.body.description &&
                request.body.notes
            )
        ) {
            const missingFields = [];

            if (!request.body.title) {
                missingFields.push("title");
            }
            if (!request.body.caregiverId) {
                missingFields.push("caregiverId");
            }

            if (!request.body.description) {
                missingFields.push("description");
            }

            if (!request.body.notes) {
                missingFields.push("notes");
            }

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

        const appointments = await db.appointments
            .create({
                title: request.body.title,
                description: request.body.description,
                notes: request.body.notes,
                patient: request.account?.id,
                caregiver: request.body.caregiverId,
            })
            .then(appointment =>
                appointment
                    .populate("patient")
                    .then(appointment => appointment.populate("caregiver")),
            );

        await appointments.save();

        return {
            statusCode: StatusCodes.OK,
            body: {
                data: appointments,
                message: "Appointment Scheduled",
            },
        };
    };
}

export function confirmAppointment() {
    return async function (request: HTTPRequest<{ id: string }, object>) {
        const appointment = await db.appointments
            .findById(request.params.id)
            .populate("patient")
            .populate("caregiver");

        console.log("params::id--> ", request.params.id);

        if (!appointment) {
            return {
                statusCode: StatusCodes.NOT_FOUND,
                body: {
                    data: null,
                    message: "Could not confirm appointment.",
                },
            };
        }

        await appointment.confirmAppointment();

        return {
            statusCode: StatusCodes.OK,
            body: {
                data: appointment,
                message: "Appointment has been confirmed and initiated",
            },
        };
    };
}

export function cancelAppointment() {
    return async function (
        request: HTTPRequest<
            { id: string },
            {
                reason?: string;
            }
        >,
    ) {
        const appointment = await db.appointments
            .findById(request.params.id)
            .populate("patient")
            .populate("caregiver");

        if (!appointment) {
            return {
                statusCode: StatusCodes.NOT_FOUND,
                body: {
                    data: null,
                    message: "Could not cancel appointment.",
                },
            };
        }

        await appointment.cancelAppointment(request.body.reason);

        return {
            statusCode: StatusCodes.OK,
            body: {
                data: appointment,
                message: "Successfully cancelled appointment",
            },
        };
    };
}

export function getAppointment() {
    return async function (request: HTTPRequest<{ id: string }>) {
        const appointment = await db.appointments
            .findById(request.params.id)
            .populate("caregiver")
            .populate("patient");

        if (!appointment) {
            return {
                statusCode: StatusCodes.NOT_FOUND,
                body: {
                    data: null,
                    message: "Could not get appointment.",
                },
            };
        }

        return {
            statusCode: StatusCodes.OK,
            body: {
                data: appointment,
                message: "Successfully fetched appointment",
            },
        };
    };
}

export function deleteAppointment() {
    return async function (request: HTTPRequest<{ id: string }>) {
        const appointment = await db.appointments.findByIdAndDelete(
            request.params.id,
        );

        return {
            statusCode: StatusCodes.OK,
            body: {
                data: appointment,
                message: "Successfully deleted appointment",
            },
        };
    };
}
