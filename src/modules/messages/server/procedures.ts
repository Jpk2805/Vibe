import { z } from "zod";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const messagesRouter = createTRPCRouter({
    getmany: baseProcedure
    .input(z.object({
        projectID: z.string().min(1, { message: "Project ID is required" }),
    }))
    .query(async ({input}) => {
        const messages = await prisma.message.findMany({
            where: {
                projectID: input.projectID,
            },
            orderBy: { 
                updatedAt: "asc" 
            },
            include: {
                fragment: true,
            },

        });
        return messages;
    }),
    create: baseProcedure
    .input(z.object({
        content: z.string().min(1, { message: "value is required" }).max(10000, { message: "value is too long" }),
        projectID: z.string().min(1, { message: "Project ID is required" }),
    }))
    .mutation(async ({ input }) => {
        const newMessage = await prisma.message.create({
            data: {
                projectID: input.projectID,
                content: input.content,
                role: "USER",
                type: "RESULT",
            },
        });

        
        try {
            await inngest.send({
            name: "code-agent/run",
            data: {
                value: input.content,
                projectID: input.projectID,
            },
            });
        } catch (err) {
            console.error("Inngest failed", err);
            // DO NOT throw — message is already created
        }

        return newMessage; 
    })
    
});