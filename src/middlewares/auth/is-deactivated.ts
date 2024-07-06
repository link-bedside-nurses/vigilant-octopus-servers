import type { NextFunction, Request, Response } from 'express';

import { Exception } from '../../utils';
import { StatusCodes } from 'http-status-codes';
import { DESIGNATION } from '../../interfaces';
import { AdminRepo } from '../../modules/users/admins/repository';
import { CaregiverRepo } from '../../modules/users/caregivers/repository';
import { PatientRepo } from '../../modules/users/patients/repository';

export default async function isDeactivated(
	request: Request,
	_response: Response,
	next: NextFunction
) {
	let user;
	if (request.account?.designation === DESIGNATION.ADMIN) {
		user = await AdminRepo.getAdminById(request.account.id);
	} else if (request.account?.designation === DESIGNATION.CAREGIVER) {
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
