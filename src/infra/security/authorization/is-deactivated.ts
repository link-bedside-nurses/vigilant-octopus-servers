import type { NextFunction, Request, Response } from 'express';

import { StatusCodes } from 'http-status-codes';
import { DESIGNATION } from '../../../core/interfaces';
import { AdminRepo } from '../../database/repositories/admin-repository';
import { CaregiverRepo } from '../../database/repositories/caregiver-repository';
import HTTPException from '../../../core/utils/exception';
import { PatientRepo } from '../../database/repositories/patient-repository';

export default async function isActive(request: Request, _response: Response, next: NextFunction) {
	let user;
	if (request.account?.designation === DESIGNATION.ADMIN) {
		user = await AdminRepo.getAdminById(request.account.id);
	} else if (request.account?.designation === DESIGNATION.CAREGIVER) {
		user = await CaregiverRepo.getCaregiverById(request.account.id);
	} else if (request.account?.designation === DESIGNATION.PATIENT) {
		user = await PatientRepo.getPatientById(request.account.id);
	}

	if (user?.isActive) {
		return next(
			new HTTPException(
				'Your account has been deactivated. Contact support for re-activation',
				StatusCodes.FORBIDDEN
			)
		);
	}

	return next();
}
