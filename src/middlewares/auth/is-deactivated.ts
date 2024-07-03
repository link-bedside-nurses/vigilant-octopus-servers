import type { NextFunction, Request, Response } from 'express';

import { Exception } from '../../utils';
import { StatusCodes } from 'http-status-codes';
import { DESIGNATION } from '../../interfaces';
import { AdminRepo } from '../../modules/users/admins/repo';
import { CaregiverRepo } from '../../modules/users/caregivers/repo';
import { PatientRepo } from '../../modules/users/patients/repo';

export default async function isDeactivated(
	request: Request,
	_response: Response,
	next: NextFunction
) {
	let user;
	if (request.account?.designation === DESIGNATION.ADMIN) {
		user = await AdminRepo.getAdminById(request.account.id);
	} else if (request.account?.designation === DESIGNATION.NURSE) {
		user = await CaregiverRepo.getCaregiverById(request.account.id);
	} else if (request.account?.designation === DESIGNATION.PATIENT) {
		user = await PatientRepo.getPatientById(request.account.id);
	}

	if (user?.isDeactivated) {
		return next(
			new Exception(
				'Your account has been deactivated. Contact support for re-activation',
				StatusCodes.FORBIDDEN
			)
		);
	}

	return next();
}
