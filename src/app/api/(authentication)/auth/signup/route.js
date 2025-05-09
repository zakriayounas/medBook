import { NextResponse } from "next/server";
import {
    createUser,
    getUserWithoutPassword
} from "../../../../../../lib/UserHelpers";

export async function POST(req) {
    try {
        const formData = await req.formData();
        const data = Object.fromEntries(formData.entries());
        const { email, password, name, confirm_password, gender } = data;
        const newUserResponse = await createUser({
            email,
            password,
            name,
            confirm_password, gender
        });

        if (!newUserResponse.success) {
            return NextResponse.json(
                { success: false, message: newUserResponse.error },
                { status: 400 }
            );
        }

        const newUser = newUserResponse.user;

        return NextResponse.json(
            {
                success: true,
                message: "Signup successful!",
                user: getUserWithoutPassword(newUser),
            },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
