import { pgTable, serial, text, varchar,integer } from "drizzle-orm/pg-core";

export const schedule = pgTable("schedule", {
    id: serial("id").primaryKey(),
    date: integer("date"),
    time: integer("time"),
    subject: varchar("subject"),
    belongings: varchar("belongings"),
    memo: text("memo")
});
