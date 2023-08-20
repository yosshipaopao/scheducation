import {pgTable, serial, varchar, integer, boolean, text, timestamp, primaryKey} from "drizzle-orm/pg-core";
import type {AdapterAccount} from "@auth/core/adapters";


//Class
export const ClassEntry = pgTable("ClassEntry", {
    id: serial("id").primaryKey(),
    grade: integer("grade").notNull(),
    class: integer("class").notNull(),
});


//User

export const users = pgTable("user", {
    id: text("id").notNull().primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    class: integer("class").references(() => ClassEntry.id),
})

export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccount["type"]>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => ({
        compoundKey: primaryKey(account.provider, account.providerAccountId),
    })
)

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").notNull().primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey(vt.identifier, vt.token),
    })
)

//Schedule

//class=>class_id
//date=>ex:20230813
//day=>0~6
export const DateEntry = pgTable("DateEntry", {
    id: serial("id").primaryKey(),//いらない
    class: integer("class").notNull().references(() => ClassEntry.id),//まだいらない
    date: integer("date").notNull(),
    day: integer("day").notNull(),
    info: varchar("info").notNull().default(""),
    holiday: boolean("holiday").notNull().default(false)
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

//task
export const Task = pgTable("Task", {
    id:varchar("id").primaryKey(),
    class: integer("class").notNull().references(() => ClassEntry.id),
    user: text("user").notNull().references(() => users.id),
    limitDate: integer("limitDate").notNull(),
    limitTime: integer("limitTime").notNull(),
    title: varchar("title").notNull().default(""),
    description: varchar("description").notNull().default(""),
});

export const TaskStatus = pgTable("TaskStatus", {
    id: serial("id").primaryKey(),
    user: text("user").notNull().references(() => users.id),
    task: varchar("task").notNull().references(() => Task.id),
});