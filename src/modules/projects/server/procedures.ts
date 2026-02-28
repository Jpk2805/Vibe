import { z } from "zod";
import {generateSlug} from "random-word-slugs";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { consumeCredits } from "@/lib/usage";

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

        const createdProject = await prisma.project.create({
            data: {
                userId: ctx.auth.userId,
                name: generateSlug(2, { format: "kebab" }),
            }
        });

        await prisma.message.create({
            data: {
                projectID: createdProject.id,
                content: input.content,
                role: "USER",
                type: "RESULT",
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
    }),
    
    restore: protectedProcedure
    .input(z.object({
        fragmentId: z.string().min(1, { message: "Fragment ID is required" }),
    }))
    .mutation(async ({ input, ctx }) => {
        const fragment = await prisma.fragment.findUnique({
            where: { id: input.fragmentId },
            include: { message: { include: { project: true } } }
        });

        if (!fragment || fragment.message.project.userId !== ctx.auth.userId) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Fragment not found" });
        }

        const { Sandbox } = await import("@e2b/code-interpreter");
        const { runNextjsDevServer } = await import("@/inngest/utils");

        const sandbox = await Sandbox.create("vibe-nextjs-v12");
        await sandbox.setTimeout(60000 * 30); // 30 Minutes

        const files = fragment.files as Record<string, string>;
        if (files) {
            for (const [filePath, content] of Object.entries(files)) {
                const resolvedPath = filePath.startsWith("/")
                ? filePath
                : `/home/user/app/${filePath.replace(/^app\//, "")}`;

                await sandbox.files.write(resolvedPath, content);
            }
        }

        const sandboxUrl = await runNextjsDevServer(sandbox, {
            cwd: "/home/user",
            port: 3000,
        });

        await prisma.fragment.update({
            where: { id: fragment.id },
            data: { sandboxUrl }
        });

        return { sandboxUrl };
    }),
});