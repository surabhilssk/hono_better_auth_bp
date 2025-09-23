import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { openAPI } from "better-auth/plugins";
import { PrismaClient } from "../generated/prisma/edge";
import { withAccelerate } from "@prisma/extension-accelerate";


export function betterInit(env: {DATABASE_URL:string, GITHUB_CLIENT_ID: string, GITHUB_CLIENT_SECRET: string}) {
    const prisma = new PrismaClient({
        datasourceUrl: env.DATABASE_URL,
    }).$extends(withAccelerate());

    return betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    trustedOrigins: [
        "http://localhost:3000",
    ],
    advanced: {
        defaultCookieAttributes: {
            sameSite: "none",
            secure: true,
            httpOnly: true,
        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    socialProviders: {
        github: {
            clientId: env.GITHUB_CLIENT_ID as string,
            clientSecret: env.GITHUB_CLIENT_SECRET as string,
        }
    },
    plugins: [
        openAPI(),
    ]
});
}