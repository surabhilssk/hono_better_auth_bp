import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { openAPI } from "better-auth/plugins";
import { PrismaClient } from "../generated/prisma/edge";
import { withAccelerate } from "@prisma/extension-accelerate";


export function betterInit(env: {DATABASE_URL:string}) {
    const prisma = new PrismaClient({
        datasourceUrl: env.DATABASE_URL,
    }).$extends(withAccelerate());

    return betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        openAPI(),
    ]
});
}