import prisma from "./prisma";

export const includeDoctorFullProfile = {
    profile: {
        select: {
            name: true,
            profileColor: true,
            profileImage: true,
            profilePublicId: true,
        },
    },
};

export const validateIsDoctorExist = async (userId, includeProfile = false) => {
    try {
        const doctor = await prisma.doctor.findUnique({
            where: { userId },
            include: includeProfile ? includeDoctorFullProfile : undefined,
        });

        if (doctor) {
            return { exists: true, doctor };
        }

        return { exists: false, doctor: null };
    } catch (error) {
        console.error("Error validating doctor existence:", error);
        throw new Error("Failed to validate doctor existence");
    }
};
