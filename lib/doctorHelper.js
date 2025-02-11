import prisma from "./prisma";


export const validateIsDoctorExists = async (whereClause) => {
    try {
        const doctor = await prisma.doctors.findUnique({
            where: whereClause,
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
