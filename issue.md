# 📋 Planning: User Registration API

## Deskripsi
Implementasi fitur registrasi user baru dengan endpoint `POST /api/users`. Mencakup pembuatan tabel `users` di database, schema Drizzle, service layer untuk business logic (termasuk hashing password dengan bcrypt), dan route ElysiaJS.

---

## Tahap 1: Install Dependency Tambahan

Install package `bcryptjs` dan type-nya:

```bash
bun add bcryptjs
bun add -d @types/bcryptjs
```

---

## Tahap 2: Update Drizzle Schema

**File:** `src/db/schema.ts`

Ganti atau update schema tabel `users` yang sudah ada menjadi seperti berikut:

```typescript
import { mysqlTable, serial, varchar, timestamp } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

---

## Tahap 3: Generate & Jalankan Migrasi

Setelah schema diupdate, generate file migrasi baru dan terapkan ke database:

```bash
bun run db:generate
bun run db:migrate
```

> **Catatan:** Pastikan server MySQL lokal sudah berjalan dan konfigurasi `DATABASE_URL` di `.env` sudah benar sebelum menjalankan migrasi.

---

## Tahap 4: Buat User Service

**File:** `src/services/user-service.ts`

Service ini berisi business logic untuk registrasi user. Tugasnya:
1. Cek apakah email sudah terdaftar di database.
2. Jika sudah ada, lempar error.
3. Jika belum, hash password menggunakan `bcryptjs`.
4. Simpan user baru ke database.

```typescript
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';

export async function registerUser(name: string, email: string, password: string) {
  // 1. Cek apakah email sudah terdaftar
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    throw new Error('Email sudah terdaftar');
  }

  // 2. Hash password menggunakan bcrypt (salt round = 10)
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Simpan user baru ke database
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return 'OK';
}
```

---

## Tahap 5: Buat User Route

**File:** `src/routes/users-route.ts`

Route ini menerima request dari client, memvalidasi input, dan memanggil service untuk proses registrasi.

```typescript
import { Elysia, t } from 'elysia';
import { registerUser } from '../services/user-service';

export const usersRoute = new Elysia({ prefix: '/api/users' })
  .post(
    '/',
    async ({ body, set }) => {
      try {
        const result = await registerUser(body.name, body.email, body.password);
        return { data: result };
      } catch (error: any) {
        set.status = 400;
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 6 }),
      }),
    }
  );
```

---

## Tahap 6: Daftarkan Route ke Server

**File:** `src/index.ts`

Import dan pasang route baru ke server Elysia utama:

```typescript
import { Elysia } from 'elysia';
import { usersRoute } from './routes/users-route';

const port = Number(process.env.PORT) || 3000;

const app = new Elysia()
  .use(usersRoute)
  .listen(port);

console.log(`🦊 Server running at http://${app.server?.hostname}:${app.server?.port}`);
```

---

## Tahap 7: Testing Manual

Jalankan server dengan:

```bash
bun run dev
```

Test endpoint menggunakan `curl`:

**Registrasi user baru (berhasil):**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Rudi","email":"rudi@localhost","password":"rahasia"}'
```
**Expected Response:**
```json
{ "data": "OK" }
```

**Registrasi dengan email yang sama (error):**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Rudi","email":"rudi@localhost","password":"rahasia"}'
```
**Expected Response:**
```json
{ "error": "Email sudah terdaftar" }
```

---

## Struktur Folder Akhir

```
src/
├── index.ts
├── db/
│   ├── index.ts
│   └── schema.ts       ← diupdate (tambah kolom password)
├── routes/
│   └── users-route.ts  ← file baru
└── services/
    └── user-service.ts ← file baru
```

---

## Checklist Implementasi

- [ ] Install `bcryptjs` dan `@types/bcryptjs`
- [ ] Update schema `users` di `src/db/schema.ts` (tambah kolom `password`)
- [ ] Generate & jalankan migrasi database
- [ ] Buat `src/services/user-service.ts` dengan logic registrasi & hashing
- [ ] Buat `src/routes/users-route.ts` dengan endpoint `POST /api/users`
- [ ] Daftarkan `usersRoute` ke `src/index.ts`
- [ ] Test semua skenario: sukses, email duplikat, dan input tidak valid

