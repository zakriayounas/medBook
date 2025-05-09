import { NextResponse } from "next/server";
import { extractLoggedUserDetail, getUserWithoutPassword } from "../../../../../../lib/UserHelpers";
import { handleFileDelete, handleFileUpload } from "../../../../../../lib/fileHandler";
import prisma from "../../../../../../lib/prisma";

export const POST = async (req) => {
    try {
        const { userId } = extractLoggedUserDetail(req);
        const formData = await req.formData();
        const data = Object.fromEntries(formData.entries());
        const { name, addresses, dateOfBirth, gender } = data;

        const file = formData.get("profileImage");
        let profileImage = null;
        let profilePublicId = null;
        if (file) {
            const uploadResult = await handleFileUpload(file);
            if (!uploadResult.success) {
                return NextResponse.json({
                    message: "Profile image upload failed",
                    status: 500,
                });
            }
            profileImage = uploadResult.secure_url;
            profilePublicId = uploadResult.public_id;
            const existingUser = await prisma.users.findUnique({
                where: { id: userId },
            });
            if (existingUser && existingUser.profilePublicId) {
                const deleteResult = await handleFileDelete(
                    existingUser.profilePublicId
                );
                if (!deleteResult.success) {
                    return NextResponse.json({
                        message: "Failed to delete previous profile image",
                        status: 500,
                    });
                }
            }
        }

        const updatedUserData = {};
        if (name) updatedUserData.name = name;
        if (addresses) updatedUserData.addresses = addresses;
        if (dateOfBirth) updatedUserData.dateOfBirth = new Date(dateOfBirth);
        if (gender) updatedUserData.gender = gender;
        if (profileImage) updatedUserData.profileImage = profileImage;
        if (profilePublicId) updatedUserData.profilePublicId = profilePublicId;

        const updatedUserProfile = await prisma.users.update({
            where: { id: userId },
            data: updatedUserData,
        });
        return NextResponse.json({
            status: 200,
            message: "Profile updated successfully!",
            user: getUserWithoutPassword(updatedUserProfile),
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 500, message: error.message || "Internal server error" });
    }
};
