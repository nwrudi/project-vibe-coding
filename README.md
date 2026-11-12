# Project Vibe Coding

REST API backend yang dibangun menggunakan **Bun**, **ElysiaJS**, **Drizzle ORM**, dan **MySQL**.

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Web Framework**: [ElysiaJS](https://elysiajs.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: MySQL
- **Language**: TypeScript

---

## 📁 Struktur Direktori

```
projectvibecoding/
├── drizzle/              # Generated SQL migrations
├── src/
│   ├── index.ts          # Server entry point
│   ├── db/
│   │   ├── index.ts      # Koneksi database & Drizzle instance
│   │   └── schema.ts     # Schema definition (users table with bcrypt password)
│   ├── routes/
│   │   └── users-route.ts # Elysia routing endpoint /api/users
│   └── services/
│       └── user-service.ts # Logic bisnis (registrasi & bcrypt hashing)
├── .env                  # Environment variables
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore configuration
├── drizzle.config.ts     # Konfigurasi Drizzle Kit
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # Dokumentasi project
```

---

## 🚀 Memulai

### 1. Prasyarat
- [Bun](https://bun.sh/) (v1.0+)
- MySQL Server (lokal atau cloud instance)

### 2. Instalasi Dependensi
```bash
bun install
```

### 3. Konfigurasi Environment
Salin file `.env.example` ke `.env` dan sesuaikan kredensial database Anda:
```env
PORT=3000
DATABASE_URL=mysql://root:password@localhost:3306/project_vibe
```

> **Catatan**: Pastikan database (contoh: `project_vibe`) sudah dibuat di server MySQL Anda sebelum menjalankan migrasi.

### 4. Database Migration
Generate migrasi jika ada perubahan pada schema:
```bash
bun run db:generate
```

Terapkan migrasi ke database MySQL:
```bash
bun run db:migrate
```

### 5. Jalankan Server
Mode Development (hot reload):
```bash
bun run dev
```

Mode Production:
```bash
bun run start
```

---

## 📡 API Endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/` | API status & info |
| `POST` | `/api/users` | Registrasi user baru (password di-hash dengan bcrypt) |
| `POST` | `/api/users/login` | Login user & mendapatkan session token |
| `POST` | `/api/users/current` | Mendapatkan data user saat ini berdasarkan Authorization header |

### Contoh Request & Response

#### `POST /api/users`
**Request Body:**
```json
{
  "name": "Rudi",
  "email": "rudi@localhost",
  "password": "rahasia"
}
```

**Response Sukses (200):**
```json
{
  "data": "OK"
}
```

**Response Error (400) - Email Duplikat:**
```json
{
  "Error": "Email sudah terdaftar"
}
```

#### `POST /api/users/login`
**Request Body:**
```json
{
  "email": "rudi@localhost",
  "password": "rahasia"
}
```

**Response Sukses (200):**
```json
{
  "data": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response Error (400):**
```json
{
  "Error": "Email atau password salah"
}
```

#### `POST /api/users/current`
**Headers:**
```
Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000
```

**Response Sukses (200):**
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

**Response Error (401):**
```json
{
  "Error": "Unauthorized"
}
```

---

## 📜 Available Scripts

- `bun run dev` - Menjalankan server dalam mode watch (reload otomatis saat ada perubahan kode)
- `bun run start` - Menjalankan server
- `bun run db:generate` - Men-generate file migration Drizzle dari schema
- `bun run db:migrate` - Menjalankan migrasi Drizzle ke MySQL
- `bun run typecheck` - Memeriksa tipe data TypeScript (`bun check`)
