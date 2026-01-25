import { z } from "zod";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { consumeCredits } from "@/lib/usage";

export const messagesRouter = createTRPCRouter({
    getmany: protectedProcedure
    .input(z.object({
        projectID: z.string().min(1, { message: "Project ID is required" }),
    }))
    .query(async ({input,ctx}) => {
        const messages = await prisma.message.findMany({
            where: {
                projectID: input.projectID,
                project:{
                    userId: ctx.auth.userId
                }
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
    create: protectedProcedure
    .input(z.object({
        content: z.string().min(1, { message: "value is required" }).max(10000, { message: "value is too long" }),
        projectID: z.string().min(1, { message: "Project ID is required" }),
    }))
    .mutation(async ({ input,ctx }) => {

        const existingProject = await prisma.project.findUnique({
            where:{
                userId: ctx.auth.userId,
                id: input.projectID
            }
        })

        if (!existingProject) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Project not Found"
            })
        }

        try {
            await consumeCredits();
        } catch (error) {
            if(error instanceof Error){
                throw new TRPCError({
                    code: "BAD_REQUEST", message: error.message
                })
            }
            else{
                throw new TRPCError({
                    code:"TOO_MANY_REQUESTS",
                    message:"You have run out of credits"
                })
            }
        }

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
        }

        return newMessage; 
    })
    
});