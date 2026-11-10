import { Elysia, t } from 'elysia';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';

export const userRoutes = new Elysia({ prefix: '/users' })
  .get('/', async () => {
    const allUsers = await db.select().from(users);
    return { data: allUsers };
  })
  .get(
    '/:id',
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    },
    async ({ params: { id }, set }) => {
      const result = await db.select().from(users).where(eq(users.id, id));
      if (result.length === 0) {
        set.status = 404;
        return { error: 'User not found' };
      }
      return { data: result[0] };
    }
  )
  .post(
    '/',
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String(),
      }),
    },
    async ({ body, set }) => {
      try {
        const [result] = await db.insert(users).values({
          name: body.name,
          email: body.email,
        });
        set.status = 201;
        return {
          message: 'User created successfully',
          id: result.insertId,
        };
      } catch (error: any) {
        set.status = 400;
        return { error: error.message || 'Failed to create user' };
      }
    }
  )
  .put(
    '/:id',
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        email: t.Optional(t.String()),
      }),
    },
    async ({ params: { id }, body, set }) => {
      try {
        const existing = await db.select().from(users).where(eq(users.id, id));
        if (existing.length === 0) {
          set.status = 404;
          return { error: 'User not found' };
        }

        await db
          .update(users)
          .set({
            ...(body.name ? { name: body.name } : {}),
            ...(body.email ? { email: body.email } : {}),
          })
          .where(eq(users.id, id));

        return { message: 'User updated successfully' };
      } catch (error: any) {
        set.status = 400;
        return { error: error.message || 'Failed to update user' };
      }
    }
  )
  .delete(
    '/:id',
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    },
    async ({ params: { id }, set }) => {
      const existing = await db.select().from(users).where(eq(users.id, id));
      if (existing.length === 0) {
        set.status = 404;
        return { error: 'User not found' };
      }

      await db.delete(users).where(eq(users.id, id));
      return { message: 'User deleted successfully' };
    }
  );

export const routes = new Elysia()
  .get('/', () => ({
    message: 'Welcome to ElysiaJS + Drizzle + MySQL API',
    endpoints: {
      users: '/users',
    },
  }))
  .use(userRoutes);
