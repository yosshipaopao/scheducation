import {pgTable, serial, varchar, integer, boolean} from "drizzle-orm/pg-core";

export const ClassEntry = pgTable("class", {
    id: integer("id").primaryKey(),
    grade: integer("grade").notNull(),
    class: integer("class").notNull(),//0=>A,1=>B,2=>C,3=>D...
    name: varchar("name").notNull().default(""),
    teacher: varchar("teacher").notNull().default(""),
    room: varchar("room").notNull().default(""),
});

//class=>class_id
//date=>ex:20230813
//day=>0~6
export const DateEntry = pgTable("DateEntry", {
    id: integer("id").primaryKey(),//いらない
    class: integer("class").notNull().references(() => ClassEntry.id),//まだいらない
    date: integer("date").notNull(),
    day: integer("day").notNull(),
    info: varchar("info").notNull().default(""),
    holiday: boolean("holiday").notNull().default(false)
});
export const TimeTable = pgTable("TimeTable", {
    id: integer("id").primaryKey(),
    class: integer("class").notNull().references(() => ClassEntry.id),
    date: integer("date").notNull(),
    time: integer("time").notNull(),
    room: varchar("room").notNull().default(""),
    info: varchar("info").notNull().default(""),
    subject: integer("subject").notNull().references(() => Subject.id),
});
export const Subject = pgTable("Subject", {
    id: integer("id").primaryKey(),
    name: varchar("name").notNull().default(""),
    teacher: varchar("teacher").notNull().default(""),
    room: varchar("room").notNull().default(""),
    info: varchar("info").notNull().default(""),
});