import { pgTable, serial, text, varchar,integer } from "drizzle-orm/pg-core";

export const schedule = pgTable("schedule", {
    id: serial("id").primaryKey(),
    date: integer("date"),
    time: integer("time"),
    subject: varchar("subject"),
    belongings: varchar("belongings"),
    memo: text("memo")
});

export const subject = pgTable("subject", {
    count: serial("count").primaryKey(),
    id: varchar("id"),
    name: varchar("name"),
    short: varchar("short"),
    teacher: varchar("teacher"),
    room: varchar("room"),
    memo: text("memo"),
    special: integer("special").default(0)
});
