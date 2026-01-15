import { z } from "zod";
import {generateSlug} from "random-word-slugs";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const projectsRouter = createTRPCRouter({
    getmany: baseProcedure.query(async () => {
        const projects = await prisma.project.findMany({
            orderBy: { 
                updatedAt: "desc" 
            },

        });
        return projects;
    }),
    create: baseProcedure
    .input(z.object({
        content: z.string().min(1, { message: "value is required" }).max(10000, { message: "value is too long" }),
    }))
    .mutation(async ({ input }) => {
        const createdProject = await prisma.project.create({
            data: {
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