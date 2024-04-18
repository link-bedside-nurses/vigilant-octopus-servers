/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HTTPRequest } from "../../adapters/express-callback";
import { StatusCodes } from "http-status-codes";
import { db } from "../../db";
import mongoose from "mongoose";
import { Caregiver } from "../../db/schemas/Caregiver";
import { Exception } from "../../utils";

export function getAllCaregivers() {
    return async function (
        request: HTTPRequest<object, object, { latLng: string }>,
    ) {
        const { latLng } = request.query;
        const latitude = latLng.split(",")[0];
        const longitude = latLng.split(",")[1];

        let caregivers = [];

        if (latLng && latitude && longitude) {
            // prettier-ignore
            const pipeline: mongoose.PipelineStage[] = [
                {
                    '$geoNear': {
                        'near': {
                            'type': "Point",
                            'coordinates': [parseFloat(longitude), parseFloat(latitude)],
                        },
                        'distanceField': "distance",
                    },
                },
                {
                    '$sort': {
                        'distance': 1,
                    },
                },
            ];

            caregivers = await db.appointments.aggregate(pipeline);
        } else {
            caregivers = await db.caregivers
                .find({})
                .sort({ createdAt: "desc" });
        }

        return {
            statusCode: StatusCodes.OK,
            body: {
                data: caregivers,
                message: "caregivers Retrieved",
            },
        };
    };
}

export function getCaregiver() {
    return async function (
        request: HTTPRequest<{
            id: string;
        }>,
    ) {
        const caregiver = await db.caregivers.findById(request.params.id);

        if (!caregiver) {
            return {
                statusCode: StatusCodes.NOT_FOUND,
                body: {
                    message: "No caregiver Found",
                    data: null,
                },
            };
        }

        return {
            statusCode: StatusCodes.OK,
            body: {
                data: caregiver,
                message: "caregiver Retrieved",
            },
        };
    };
}

export function deleteCaregiver() {
    return async function (
        request: HTTPRequest<{
            id: string;
        }>,
    ) {
        const caregiver = await db.caregivers.findByIdAndDelete(
            request.params.id,
        );

        if (!caregiver) {
            return {
                statusCode: StatusCodes.NOT_FOUND,
                body: {
                    message: "No caregiver Found",
                    data: null,
                },
            };
        }

        return {
            statusCode: StatusCodes.OK,
            body: {
                data: caregiver,
                message: "caregiver deleted",
            },
        };
    };
}

interface UpdateBody {
    phone: string;
    firstName: string;
    lastName: string;
    nin: string;
    medicalLicenseNumber: string;
    description: string;
    placeOfReception: string;
    speciality: string[];
    languages: string[];
    affiliations: string[];
    experience: 0;
    servicesOffered: string[];
    imgUrl: string;
}

export function updateCaregiver() {
    return async function (
        request: HTTPRequest<
            {
                id: string;
            },
            UpdateBody
        >,
    ) {
        const caregiver = await db.caregivers.findByIdAndUpdate(
            request.params.id,
            { ...request.body },
            { new: true },
        );

        if (!caregiver) {
            return {
                statusCode: StatusCodes.NOT_FOUND,
                body: {
                    message: "No caregiver Found",
                    data: null,
                },
            };
        }

        return {
            statusCode: StatusCodes.OK,
            body: {
                data: caregiver,
                message: "caregiver updated",
            },
        };
    };
}

export function deactivateCaregiver() {
    return async function (
        request: HTTPRequest<
            {
                id: string;
            },
            UpdateBody
        >,
    ) {
        const caregiver = await db.caregivers.findByIdAndUpdate(
            request.params.id,
            { $set: { isDeactivated: true } },
            { new: true },
        );

        if (!caregiver) {
            return {
                statusCode: StatusCodes.NOT_FOUND,
                body: {
                    message: "No caregiver Found",
                    data: null,
                },
            };
        }

        return {
            statusCode: StatusCodes.OK,
            body: {
                data: caregiver,
                message: "Account successfully deactivated",
            },
        };
    };
}

const locationBasedSearch = async (params: {
    location: { lat: number; lng: number };
    distance?: number; // in kilometres
    criteria?: string;
}) => {
    console.log(params);
    const { location: coords, distance: radiusInKm = 8.8 } = params;

    // validating search criteria query option

    // get location coords
    const searchRadius = radiusInKm / 1.60934 / 3963.2;
    const longitude = coords.lng;
    const latitude = coords.lat;

    // query filter ...
    let queryFilter: mongoose.FilterQuery<Caregiver> = {};

    queryFilter = {
        ...queryFilter,
        location: {
            $geoWithin: {
                $centerSphere: [[longitude, latitude], searchRadius],
            },
        },
    };

    // search through the database
    const resultingCaregivers = await db.caregivers.find({
        ...queryFilter,
    });

    return resultingCaregivers;
};

export function searchCaregiversByLocation() {
    return async function (
        req: HTTPRequest<
            object,
            object,
            {
                lat: string;
                lng: string;
                distance: string;
            }
        >,
    ) {
        const queryParams = req.query;

        console.log(queryParams);

        if (!queryParams.lat || !queryParams.lng) {
            throw new Exception(`Provide both 'lat' and 'lng' as query params`);
        }
        const latitude: number = parseFloat(queryParams.lat);
        const longitude: number = parseFloat(queryParams.lng);

        // filters
        let filter: Partial<{ distance: number }> = {};
        if (queryParams.distance) {
            filter = { ...filter, distance: parseFloat(queryParams.distance) };
        }

        const caregivers = await locationBasedSearch({
            location: { lat: latitude, lng: longitude },
            ...filter,
        });

        return {
            statusCode: StatusCodes.OK,
            body: {
                data: caregivers || [],
                message:
                    caregivers.length > 0
                        ? `Found ${caregivers.length} result(s)`
                        : "No results found",
            },
        };
    };
}
