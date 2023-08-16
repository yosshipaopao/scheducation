import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import {NEW_DATABASE_URL} from "$env/static/private";

export const db = drizzle(postgres(NEW_DATABASE_URL));