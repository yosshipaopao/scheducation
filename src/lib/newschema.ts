import {pgTable, serial, varchar, integer} from "drizzle-orm/pg-core";

export const ClassEntry = pgTable("class", {
    id: serial("id").primaryKey(),
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
    id: serial("id").primaryKey(),//いらない
    class: integer("class").notNull().references(() => ClassEntry.id),//まだいらない
    date: integer("date").notNull(),
    day: integer("day").notNull(),
    info: varchar("info").notNull().default(""),
    //isHoliday=>check if it has timetable of that day and date
    //isSpecial=>check if it has timetable of that date
});
export const TimeTable = pgTable("TimeTable", {
    id: serial("id").primaryKey(),
    class: integer("class").notNull().references(() => ClassEntry.id),
    date: integer("date").notNull(),
    time: integer("time").notNull(),
    room: varchar("room").notNull().default(""),
    info: varchar("info").notNull().default(""),
    subject: integer("subject").notNull().references(() => Subject.id),
});
export const Subject = pgTable("Subject", {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull().default(""),
    teacher: varchar("teacher").notNull().default(""),
    room: varchar("room").notNull().default(""),
    info: varchar("info").notNull().default(""),
});