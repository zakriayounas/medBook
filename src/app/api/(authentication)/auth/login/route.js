import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { getUserWithoutPassword } from '../../../../../../lib/UserHelpers';

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }
        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 404 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }
        let doctorId = null
        if (user?.role === "DOCTOR") {
            const doctor = await prisma.doctors.findFirst({
                where: {
                    userId: user?.id
                },
                select: {
                    id: true
                }
            })
            doctorId = doctor?.id
        }
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role, doctorId: doctorId },
            process.env.JWT_SECRET_KEY
        );
        return NextResponse.json(
            {
                success: true,
                message: 'Login successful.',
                user: getUserWithoutPassword({ ...user, doctorId }),
                token
            }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
