import { Elysia, t } from 'elysia';
import { registerUser } from '../services/user-service';

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
  );

