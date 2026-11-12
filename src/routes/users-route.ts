import { Elysia, t } from 'elysia';
import { registerUser, loginUser, getCurrentUser } from '../services/user-service';

export const usersRoute = new Elysia({ prefix: '/api/users' })
  .post(
    '/',
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ minLength: 1 }),
        password: t.String({ minLength: 1 }),
      }),
    },
    async ({ body, set }) => {
      try {
        const result = await registerUser(body.name, body.email, body.password);
        return { data: result };
      } catch (error: any) {
        set.status = 400;
        return { Error: error.message || 'Registration failed' };
      }
    }
  )
  .post(
    '/login',
    {
      body: t.Object({
        email: t.String({ minLength: 1 }),
        password: t.String({ minLength: 1 }),
      }),
    },
    async ({ body, set }) => {
      try {
        const token = await loginUser(body.email, body.password);
        return { data: token };
      } catch (error: any) {
        set.status = 400;
        return { Error: error.message || 'Login gagal' };
      }
    }
  )
  .post(
    '/current',
    async ({ headers, set }) => {
      try {
        const authHeader = headers['authorization'];
        if (!authHeader) {
          set.status = 401;
          return { Error: 'Unauthorized' };
        }

        const token = authHeader.startsWith('Bearer ')
          ? authHeader.slice(7).trim()
          : authHeader.trim();

        if (!token) {
          set.status = 401;
          return { Error: 'Unauthorized' };
        }

        const user = await getCurrentUser(token);
        return { data: user };
      } catch (error: any) {
        set.status = 401;
        return { Error: 'Unauthorized' };
      }
    }
  );
