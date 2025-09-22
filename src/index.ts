import { ExecutionContext, Hono } from 'hono'
import { betterInit } from './lib/auth'
import { RequestHeader } from 'hono/utils/headers'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
  }
}>()


app.on(["POST", "GET"], "/api/auth/*", async(c) => {
  const auth = betterInit(c.env);
  return auth.handler(c.req.raw);
});

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app







