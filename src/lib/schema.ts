import { pgTable, serial, text, varchar,integer } from "drizzle-orm/pg-core";

export const schedule = pgTable("schedule", {
    id: serial("id").primaryKey(),
    date: integer("date").notNull(),
    time: integer("time").notNull(),
    subject: varchar("subject").notNull(),
    belongings: varchar("belongings").default(""),
    special: integer("special").default(0).notNull(),
    memo: text("memo").default(""),
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
