import { HTTPRequest } from '../../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { db } from '../../../database';
import mongoose from 'mongoose';
import { Caregiver } from '../../../database/models/Caregiver';
import { response } from '../../../utils/http-response';
import HTTPException from '../../../utils/exception';

const locationBasedSearch = async ( params: {
	location: { lat: number; lng: number };
	distance?: number; // in kilometres
	criteria?: string;
} ) => {
	console.log( 'calling locationBasedSearch' );
	console.log( 'params', params );
	const { location: coords, distance: radiusInKm = 8.8 } = params;
	console.log( 'coords', coords );
	console.log( 'radiusInKm', radiusInKm );

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

	const resultingCaregivers = await db.caregivers.find( queryFilter );
	console.log( 'resultingCaregivers', resultingCaregivers );
	return resultingCaregivers;
};

export function searchCaregiversByLocation() {
	return async function (
		req: HTTPRequest<object, object, { lat: string; lng: string; distance: string }>
	) {
		console.log( 'calling searchCaregiversByLocation' );
		const queryParams = req.query;
		console.log( 'queryParams', queryParams );


		if ( !queryParams.lat || !queryParams.lng ) {
			console.log( 'Provide both lat and lng as query params' );
			throw new HTTPException( `Provide both 'lat' and 'lng' as query params` );
		}
		console.log( 'queryParams.lat', queryParams.lat );
		console.log( 'queryParams.lng', queryParams.lng );
		const latitude: number = parseFloat( queryParams.lat );
		const longitude: number = parseFloat( queryParams.lng );
		console.log( 'latitude', latitude );
		console.log( 'longitude', longitude );

		let filter: Partial<{ distance: number }> = {};
		if ( queryParams.distance ) {
			filter = { ...filter, distance: parseFloat( queryParams.distance ) };
		}

		const caregivers = await locationBasedSearch( {
			location: { lat: latitude, lng: longitude },
			...filter,
		} );
		console.log( 'caregivers', caregivers );

		const message =
			caregivers.length > 0 ? `Found ${caregivers.length} result(s)` : 'No results found';
		console.log( 'message', message );

		return response( StatusCodes.OK, caregivers || [], message );
	};
}
