import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { db } from '../../../infrastructure/database';
import mongoose from 'mongoose';
import { Caregiver } from '../../../infrastructure/database/models/Caregiver';
import { response } from '../../../core/utils/http-response';
import HTTPException from '../../../core/utils/exception';

const locationBasedSearch = async (params: {
	location: { lat: number; lng: number };
	distance?: number; // in kilometres
	criteria?: string;
}) => {
	const { location: coords, distance: radiusInKm = 8.8 } = params;

	const searchRadius = radiusInKm / 1.60934 / 3963.2;
	const longitude = coords.lng;
	const latitude = coords.lat;

	let queryFilter: mongoose.FilterQuery<Caregiver> = {};

	queryFilter = {
		...queryFilter,
		location: {
			$geoWithin: {
				$centerSphere: [[longitude, latitude], searchRadius],
			},
		},
	};

	const resultingCaregivers = await db.caregivers.find({
		...queryFilter,
	});

	return resultingCaregivers;
};

export function searchCaregiversByLocation() {
	return async function (
		req: HTTPRequest<object, object, { lat: string; lng: string; distance: string }>
	) {
		const queryParams = req.query;

		if (!queryParams.lat || !queryParams.lng) {
			throw new HTTPException(`Provide both 'lat' and 'lng' as query params`);
		}
		const latitude: number = parseFloat(queryParams.lat);
		const longitude: number = parseFloat(queryParams.lng);

		let filter: Partial<{ distance: number }> = {};
		if (queryParams.distance) {
			filter = { ...filter, distance: parseFloat(queryParams.distance) };
		}

		const caregivers = await locationBasedSearch({
			location: { lat: latitude, lng: longitude },
			...filter,
		});

		const message =
			caregivers.length > 0 ? `Found ${caregivers.length} result(s)` : 'No results found';

		return response(StatusCodes.OK, caregivers || [], message);
	};
}
