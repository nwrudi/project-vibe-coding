import { Elysia } from 'elysia';
import { routes } from './routes';

const port = Number(process.env.PORT) || 3000;

const app = new Elysia()
  .use(routes)
  .listen(port);

console.log(`🦊 Elysia server is running at http://${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;

