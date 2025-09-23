import { Hono } from 'hono'
import { betterInit } from './lib/auth'
import { cors } from 'hono/cors'
import { userRouter } from './routes/blogs'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    GITHUB_CLIENT_ID: string,
    GITHUB_CLIENT_SECRET: string,
  }
}>()

app.use(
	"/api/auth/*", // or replace with "*" to enable cors for all routes
	cors({
		origin: "http://localhost:3000", // replace with your origin
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", async(c) => {
  const auth = betterInit(c.env);
  return auth.handler(c.req.raw);
});

app.route("/user/blogs", userRouter);

export default app







