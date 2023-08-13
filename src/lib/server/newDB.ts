import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

export const db = drizzle(postgres(import.meta.env.VITE_NEW_DATABASE_URL));