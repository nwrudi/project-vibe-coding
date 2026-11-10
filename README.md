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
│   │   └── schema.ts     # Schema definition (users table)
│   └── routes/
│       └── index.ts      # Elysia CRUD route handlers & validation
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
| `GET` | `/users` | Menampilkan seluruh data user |
| `GET` | `/users/:id` | Mengambil detail user berdasarkan ID |
| `POST` | `/users` | Menambahkan user baru |
| `PUT` | `/users/:id` | Memperbarui data user berdasarkan ID |
| `DELETE` | `/users/:id` | Menghapus user berdasarkan ID |

### Contoh Request & Payload

#### `POST /users`
```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com"
}
```

#### `PUT /users/:id`
```json
{
  "name": "Budi S."
}
```

---

## 📜 Available Scripts

- `bun run dev` - Menjalankan server dalam mode watch (reload otomatis saat ada perubahan kode)
- `bun run start` - Menjalankan server
- `bun run db:generate` - Men-generate file migration Drizzle dari schema
- `bun run db:migrate` - Menjalankan migrasi Drizzle ke MySQL
- `bun run typecheck` - Memeriksa tipe data TypeScript (`bun check`)
