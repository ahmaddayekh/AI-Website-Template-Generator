import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const email = "admin@example.com";
        const password = "Admin@2026#TemplateGen!92";
        
        const existingAdmin = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (existingAdmin) {
            const hashedPassword = await bcrypt.hash(password, 10);

            const updatedAdmin = await prisma.user.update({
                where: {
                    email
                },
                data: {
                    name: "Admin",
                    password: hashedPassword,
                    role: "admin"
                }
            });

            console.log("Admin user already existed. Password and role updated:");
            console.log(updatedAdmin.email);
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await prisma.user.create({
            data: {
                name: "Admin",
                email,
                password: hashedPassword,
                role: "admin"
            }
        });

        console.log("Admin user created:");
        console.log(admin.email);
    } catch (error) {
        console.error("Create admin error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();