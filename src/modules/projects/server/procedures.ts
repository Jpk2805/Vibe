import { z } from "zod";
import {generateSlug} from "random-word-slugs";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const projectsRouter = createTRPCRouter({
    getOne: protectedProcedure
    .input(z.object({
        id: z.string().min(1,{
            message: "Provide Project ID"
        })
    }))
    .query(async ({input, ctx}) => {

        const existingProject = await prisma.project.findUnique({
            where: {
                userId: ctx.auth.userId,
                id: input.id
            }
        });

        if (!existingProject) {
            throw new TRPCError({code: "NOT_FOUND", message: "Project not found!"})
        }
        return existingProject;
    }),
    getmany: protectedProcedure.query(async ({ctx}) => {
        const projects = await prisma.project.findMany({
            where: {
                userId: ctx.auth.userId
            },
            orderBy: { 
                updatedAt: "desc" 
            },

        });
        return projects;
    }),
    create: protectedProcedure
    .input(z.object({
        content: z.string().min(1, { message: "value is required" }).max(10000, { message: "value is too long" }),
    }))
    .mutation(async ({ input, ctx }) => {
        const createdProject = await prisma.project.create({
            data: {
                userId: ctx.auth.userId,
                name: generateSlug(2, { format: "kebab" }),
                messages: {
                    create: {
                        content: input.content,
                        role: "USER",
                        type: "RESULT",
                    }
                }
            }
        });


        await inngest.send({
            name: "code-agent/run",
            data: {
              value: input.content, 
              projectID: createdProject.id,
            },
        });

        return createdProject; 
    })
    
});