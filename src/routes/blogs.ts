import { Hono } from "hono";
import { betterInit } from "../lib/auth";


export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        GITHUB_CLIENT_ID: string,
        GITHUB_CLIENT_SECRET: string,
    },
    Variables:{
        user: any,
        session: any
    }
}>();

userRouter.use("*", async(c, next) => {
    const auth = betterInit(c.env);
    const session = await auth.api.getSession({headers: c.req.raw.headers});
    if (!session) {
    	c.set("user", null);
    	c.set("session", null);
    	return next();
  	}

  	c.set("user", session.user);
  	c.set("session", session.session);
  	return next();
})

userRouter.get("/", (c) => {
    const user = c.get("user");
    return c.json({
        message: "This is the blogs route",
        username: user
    })
})