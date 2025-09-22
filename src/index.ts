import { ExecutionContext, Hono } from 'hono'
import { betterInit } from './lib/auth'
import { RequestHeader } from 'hono/utils/headers'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
  }
}>()

//fetch used for extracting env variables
export default {
  async fetch(request: RequestHeader, env: any,ctx: ExecutionContext){
    const auth = betterInit(env);
    app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));
  return app.fetch(request, env, ctx);
  }
}







