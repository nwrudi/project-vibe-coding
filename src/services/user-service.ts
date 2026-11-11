import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';

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

