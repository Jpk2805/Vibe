import { z } from "zod";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const messagesRouter = createTRPCRouter({
    getmany: baseProcedure.query(async () => {
        const messages = await prisma.message.findMany({
            orderBy: { 
                updatedAt: "desc" 
            },
            include: {
                fragment: true,
            },

        });
        return messages;
    }),
    create: baseProcedure
    .input(z.object({
        content: z.string().min(1, { message: "Message is required" }),
    }))
    .mutation(async ({ input }) => {
        const newMessage = await prisma.message.create({
            data: {
                content: input.content,
                role: "USER",
                type: "RESULT",
            },
        });

        await inngest.send({
            name: "code-agent/run",
            data: {
              value: input.content, 
            },
        });

        return newMessage; 
    })
    
});