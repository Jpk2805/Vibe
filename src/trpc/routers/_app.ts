
import {  createTRPCRouter } from "../init";
import { messagesRouter } from "@/modules/messages/server/procedures";
import { projectsRouter } from "@/modules/projects/server/procedures";
import { usageRouter } from "@/modules/usage/sever/procedures";

export const appRouter = createTRPCRouter({
    messages: messagesRouter,
    projects: projectsRouter,
    usage: usageRouter
});

export type AppRouter = typeof appRouter;
