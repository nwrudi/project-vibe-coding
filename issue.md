# 📋 Planning: Get Current User API (POST /api/users/current)

## Deskripsi
Implementasi endpoint `POST /api/users/current` untuk mendapatkan data user yang sedang login berdasarkan token sesi yang dikirim melalui HTTP Header `Authorization`.

Fitur ini memanfaatkan tabel `sessions` dan `users` yang sudah ada, dengan menambahkan logic verifikasi token di layer service dan penambahan route di ElysiaJS.

---

## Spesifikasi API

### Endpoint
- **URL:** `/api/users/current`
- **Method:** `POST`
- **Headers:**
  - `Authorization: Bearer <token>` (token UUID sesi login dari tabel `sessions`)

### Response Body

#### Sukses (HTTP 200)
```json
{
  "data": {
    "id": 1,
    "name": "rudi",
    "email": "rudi@localhost",
    "password": "rahasia"
  }
}
```

#### Gagal / Unauthorized (HTTP 401)
```json
{
  "Error": "Unauthorized"
}
```

---

## Tahap Implementasi

### Tahap 1: Tambahkan Logic `getCurrentUser` di Service Layer

**File:** `src/services/user-service.ts`

Tambahkan fungsi baru `getCurrentUser` yang menerima token:
1. Validasi keberadaan token. Jika token kosong/tidak ada, lempar error `"Unauthorized"`.
2. Cari token di tabel `sessions` (`sessions.token == token`).
3. Jika session tidak ditemukan, lempar error `"Unauthorized"`.
4. Ambil data user dari tabel `users` berdasarkan `userId` yang ada di session.
5. Jika user tidak ditemukan, lempar error `"Unauthorized"`.
6. Kembalikan data user (`id`, `name`, `email`, `password`).

**Panduan Kode:**
```typescript
export async function getCurrentUser(token: string) {
  if (!token) {
    throw new Error('Unauthorized');
  }

  // 1. Cari session berdasarkan token
  const sessionResult = await db.select().from(sessions).where(eq(sessions.token, token));
  if (sessionResult.length === 0) {
    throw new Error('Unauthorized');
  }

  const session = sessionResult[0]!;

  // 2. Ambil data user berdasarkan session.userId
  const userResult = await db.select().from(users).where(eq(users.id, session.userId));
  if (userResult.length === 0) {
    throw new Error('Unauthorized');
  }

  const user = userResult[0]!;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
  };
}
```

---

### Tahap 2: Tambahkan Endpoint `POST /current` di Route Layer

**File:** `src/routes/users-route.ts`

Tambahkan route baru di dalam instance `usersRoute`:
1. Baca header `Authorization` dari request headers.
2. Format header biasanya: `Bearer <token>`. Lakukan parsing untuk mengambil string token-nya (hilangkan prefix `Bearer ` jika ada).
3. Panggil fungsi `getCurrentUser(token)`.
4. Jika sukses: kembalikan `{ "data": user }` (status 200).
5. Jika gagal/error: set HTTP status `401` dan kembalikan `{ "Error": "Unauthorized" }`.

**Panduan Kode:**
```typescript
import { registerUser, loginUser, getCurrentUser } from '../services/user-service';

// Di dalam chaining usersRoute:
.post(
  '/current',
  async ({ headers, set }) => {
    try {
      const authHeader = headers['authorization'];
      if (!authHeader) {
        set.status = 401;
        return { Error: 'Unauthorized' };
      }

      // Ambil token dari format "Bearer <token>" atau raw token
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
)
```

---

### Tahap 3: Verifikasi Typecheck

Pastikan tidak ada error TypeScript pada seluruh project:

```bash
bun run typecheck
```

Harus menghasilkan output:
`✓ No type errors`

---

### Tahap 4: Testing Manual

1. Jalankan server:
   ```bash
   bun run dev
   ```

2. Lakukan login terlebih dahulu untuk mendapatkan token:
   ```bash
   curl -X POST http://localhost:3000/api/users/login \
     -H "Content-Type: application/json" \
     -d '{"email":"rudi@localhost","password":"rahasia"}'
   ```
   *Salin token UUID dari response.*

3. Test `POST /api/users/current` dengan token yang valid (Sukses):
   ```bash
   curl -X POST http://localhost:3000/api/users/current \
     -H "Authorization: Bearer <token-uuid-disini>"
   ```
   **Expected Response (200):**
   ```json
   {
     "data": {
       "id": 1,
       "name": "rudi",
       "email": "rudi@localhost",
       "password": "..."
     }
   }
   ```

4. Test `POST /api/users/current` dengan token salah / tanpa token (Gagal):
   ```bash
   curl -X POST http://localhost:3000/api/users/current \
     -H "Authorization: Bearer token-ngawur"
   ```
   **Expected Response (401):**
   ```json
   {
     "Error": "Unauthorized"
   }
   ```

---

## Struktur Folder & File Terkait

```
src/
├── db/
│   ├── index.ts        # Database instance (tidak berubah)
│   └── schema.ts       # Schema users & sessions (tidak berubah)
├── routes/
│   └── users-route.ts  # Tambah endpoint POST /current
├── services/
│   └── user-service.ts # Tambah fungsi getCurrentUser
└── index.ts            # Entry point (tidak berubah)
```

---

## Checklist Implementasi

- [ ] Tambahkan fungsi `getCurrentUser(token: string)` di `src/services/user-service.ts`
- [ ] Tambahkan endpoint `POST /current` di `src/routes/users-route.ts` dengan penanganan header `Authorization`
- [ ] Tangani error dengan status HTTP `401` dan response `{ "Error": "Unauthorized" }`
- [ ] Jalankan `bun run typecheck` untuk memastikan tidak ada kesalahan tipe data
- [ ] Test endpoint untuk skenario valid token dan invalid/missing token
