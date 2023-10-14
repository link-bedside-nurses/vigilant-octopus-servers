import { HTTPRequest } from "@/adapters/express-callback";
import { StatusCodes } from "http-status-codes";
import { db } from "@/database";

export function completePatientProfile() {
  return async function (
    request: HTTPRequest<
      object,
      {
        firstName: string;
        lastName: string;
        phone: string;
      }
    >,
  ) {
    const patientId = request?.account?.id;
    const { firstName, lastName, phone } = request.body;

    if (!patientId || !firstName || !lastName || !phone) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          data: null,
          message: "Incomplete or invalid request data",
        },
      };
    }

    const updatedPatient = await db.patients.findByIdAndUpdate(patientId, {
      firstName,
      lastName,
      phone,
    });

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: updatedPatient,
        message: "Patient's profile completed",
      },
    };
  };
}

export function completeCaregiverProfile() {
  return async function (
    request: HTTPRequest<
      object,
      {
        phone: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        nin: string;
        medicalLicenseNumber: string;
        experience: string;
        description: string;
        location: {
          lng: string;
          lat: string;
        };
        languages: string[];
        affiliations: string;
        placeOfReception: string;
        rating: number;
        speciality: string;
        servicesOffered: string;
        imageUrl: string;
      }
    >,
  ) {
    const caregiverId = request?.account?.id;
    const {
      phone,
      firstName,
      lastName,
      dateOfBirth,
      nin,
      medicalLicenseNumber,
      experience,
      description,
      location,
      languages,
      affiliations,
      placeOfReception,
      rating,
      speciality,
      servicesOffered,
      imageUrl,
    } = request.body;

    if (
      !caregiverId ||
      !phone ||
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !nin ||
      !medicalLicenseNumber ||
      !experience ||
      !description ||
      !location ||
      !languages ||
      !affiliations ||
      !placeOfReception ||
      !rating ||
      !speciality ||
      !servicesOffered ||
      !imageUrl
    ) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          data: null,
          message: "Incomplete or invalid request data",
        },
      };
    }

    const updatedCaregiver = await db.caregivers.findByIdAndUpdate(
      request?.account?.id,
      {
        phone,
        firstName,
        lastName,
        dateOfBirth,
        nin,
        medicalLicenseNumber,
        experience,
        description,
        location,
        languages,
        affiliations,
        placeOfReception,
        rating,
        speciality,
        servicesOffered,
        imageUrl,
      },
    );

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: updatedCaregiver,
        message: "Location profile completed",
      },
    };
  };
}
