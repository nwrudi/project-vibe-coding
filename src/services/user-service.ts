import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, sessions } from '../db/schema';

export async function registerUser(name: string, email: string, password: string): Promise<string> {
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

export async function loginUser(email: string, password: string): Promise<string> {
  // 1. Cari user berdasarkan email
  const result = await db.select().from(users).where(eq(users.email, email));
  if (result.length === 0) {
    throw new Error('Email atau password salah');
  }

  const user = result[0]!;

  // 2. Verifikasi password menggunakan bcrypt
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('Email atau password salah');
  }

  // 3. Generate UUID sebagai token sesi
  const token = uuidv4();

  // 4. Simpan session ke database
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return token;
}
