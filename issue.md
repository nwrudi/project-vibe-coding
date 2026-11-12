# 📋 Planning: User Login API

## Deskripsi
Implementasi fitur login user dengan endpoint `POST /api/users/login`. Mencakup pembuatan tabel `sessions` di database untuk menyimpan token login, schema Drizzle, service layer untuk verifikasi password menggunakan bcrypt dan pembuatan UUID token, serta route ElysiaJS.

---

## Tahap 1: Install Dependency Tambahan

Install package `uuid` dan type-nya:

```bash
bun add uuid
bun add -d @types/uuid
```

---

## Tahap 2: Tambah Schema Tabel `sessions`

**File:** `src/db/schema.ts`

Tambahkan definisi tabel `sessions` baru di bawah tabel `users` yang sudah ada:

```typescript
import { mysqlTable, serial, varchar, timestamp, int } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sessions = mysqlTable('sessions', {
  id: serial('id').primaryKey(),
  token: varchar('token', { length: 255 }).notNull(),
  userId: int('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
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

## Tahap 4: Tambah Logic Login di User Service

**File:** `src/services/user-service.ts`

Tambahkan fungsi `loginUser` di bawah fungsi `registerUser` yang sudah ada. Tugasnya:
1. Cari user berdasarkan email di database.
2. Jika user tidak ditemukan, lempar error `"Email atau password salah"`.
3. Verifikasi password menggunakan `bcryptjs`.
4. Jika password salah, lempar error `"Email atau password salah"`.
5. Generate UUID sebagai token sesi.
6. Simpan token ke tabel `sessions` beserta `user_id`.
7. Return token.

```typescript
import { v4 as uuidv4 } from 'uuid';
import { sessions } from '../db/schema';

export async function loginUser(email: string, password: string): Promise<string> {
  // 1. Cari user berdasarkan email
  const result = await db.select().from(users).where(eq(users.email, email));
  if (result.length === 0) {
    throw new Error('Email atau password salah');
  }

  const user = result[0];

  // 2. Verifikasi password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('Email atau password salah');
  }

  // 3. Generate UUID token
  const token = uuidv4();

  // 4. Simpan session ke database
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return token;
}
```

> **Catatan Keamanan:** Pesan error untuk email tidak ditemukan dan password salah **sengaja dibuat sama** (`"Email atau password salah"`) agar tidak memberikan petunjuk kepada penyerang tentang apakah email terdaftar atau tidak.

---

## Tahap 5: Tambah Route Login

**File:** `src/routes/users-route.ts`

Tambahkan endpoint `POST /api/users/login` di bawah endpoint registrasi yang sudah ada:

```typescript
import { loginUser } from '../services/user-service';

// Tambahkan endpoint ini di dalam usersRoute yang sudah ada
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
```

---

## Tahap 6: Tidak Ada Perubahan pada `src/index.ts`

Route login ditambahkan ke dalam `usersRoute` yang sudah didaftarkan di `src/index.ts`, sehingga **tidak ada perubahan** yang diperlukan pada file ini.

---

## Tahap 7: Testing Manual

Jalankan server:

```bash
bun run dev
```

Test endpoint menggunakan `curl`:

**Login berhasil:**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rudi@localhost","password":"rahasia"}'
```
**Expected Response:**
```json
{ "data": "550e8400-e29b-41d4-a716-446655440000" }
```

**Login gagal (email atau password salah):**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rudi@localhost","password":"salah"}'
```
**Expected Response:**
```json
{ "Error": "Email atau password salah" }
```

---

## Struktur Folder Akhir

```
src/
├── index.ts                    # tidak berubah
├── db/
│   ├── index.ts                # tidak berubah
│   └── schema.ts               # diupdate: tambah tabel sessions
├── routes/
│   └── users-route.ts          # diupdate: tambah endpoint POST /login
└── services/
    └── user-service.ts         # diupdate: tambah fungsi loginUser
```

---

## Checklist Implementasi

- [ ] Install `uuid` dan `@types/uuid`
- [ ] Update `src/db/schema.ts` — tambah tabel `sessions` dengan FK ke `users`
- [ ] Generate & jalankan migrasi database (`bun run db:generate` lalu `bun run db:migrate`)
- [ ] Update `src/services/user-service.ts` — tambah fungsi `loginUser` dengan verifikasi bcrypt dan pembuatan UUID token
- [ ] Update `src/routes/users-route.ts` — tambah endpoint `POST /api/users/login`
- [ ] Test semua skenario: login berhasil, password salah, email tidak ditemukan
