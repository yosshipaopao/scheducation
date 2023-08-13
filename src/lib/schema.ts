import {pgTable, serial, text, varchar, integer} from "drizzle-orm/pg-core";

const scheduleColumns = {
    id: serial("id").primaryKey(),
    date: integer("date").notNull(),
    time: integer("time").notNull(),
    subject: varchar("subject").notNull(),
    belongings: varchar("belongings").default("").notNull(),
    special: integer("special").default(0).notNull(),
    memo: text("memo").default("").notNull(),
}

export const schedule = pgTable("schedule", scheduleColumns);

export const deleted = pgTable("deleted", scheduleColumns)


export const subject = pgTable("subject", {
    count: serial("count").primaryKey(),
    id: varchar("id").notNull(),
    name: varchar("name").notNull().default(""),
    short: varchar("short").notNull().default(""),
    teacher: varchar("teacher").notNull().default(""),
    room: varchar("room").notNull().default(""),
    memo: text("memo").notNull().default(""),
    special: integer("special").default(0).notNull()
});
