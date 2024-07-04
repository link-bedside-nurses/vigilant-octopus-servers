import { HTTPRequest } from '../../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { db } from '../../../db';
import mongoose from 'mongoose';
import { Caregiver } from '../../../db/schemas/Caregiver';
import { Exception } from '../../../utils';
import { CaregiverRepo } from './repo';
import { UpdateCaregiverDto } from '../../../interfaces/dtos';
import { response } from '../../../utils/http-response';

export function getAllCaregivers() {
	return async function (request: HTTPRequest<object, object, { latLng: string }>) {
		const { latLng } = request.query;

		let caregivers = [];
		if (latLng) {
			caregivers = await CaregiverRepo.getAllCaregiversByCoords(latLng);
		} else {
			caregivers = await CaregiverRepo.getAllCaregivers();
		}

		return response(StatusCodes.OK, caregivers, 'Caregivers Retrieved');
	};
}

export function getCaregiver() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const caregiver = await CaregiverRepo.getCaregiverById(request.params.id);

		if (!caregiver) {
			return response(StatusCodes.NOT_FOUND, null, 'No caregiver Found');
		}

		return response(StatusCodes.OK, caregiver, 'Caregiver Retrieved');
	};
}

export function deleteCaregiver() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const caregiver = await CaregiverRepo.deleteCaregiver(request.params.id);

		if (!caregiver) {
			return response(StatusCodes.NOT_FOUND, null, 'No caregiver Found');
		}

		return response(StatusCodes.OK, caregiver, 'Caregiver deleted');
	};
}

export function updateCaregiver() {
	return async function (request: HTTPRequest<{ id: string }, UpdateCaregiverDto>) {
		const updated = request.body;
		const caregiver = await CaregiverRepo.findByIdAndUpdate(request.params.id, updated);

		if (!caregiver) {
			return response(StatusCodes.NOT_FOUND, null, 'No caregiver Found');
		}

		return response(StatusCodes.OK, caregiver, 'Caregiver updated');
	};
}

export function deactivateCaregiver() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const caregiver = await CaregiverRepo.deactivateCaregiver(request.params.id);

		if (!caregiver) {
			return response(StatusCodes.NOT_FOUND, null, 'No caregiver Found');
		}

		return response(StatusCodes.OK, caregiver, 'Account successfully deactivated');
	};
}

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
			throw new Exception(`Provide both 'lat' and 'lng' as query params`);
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
