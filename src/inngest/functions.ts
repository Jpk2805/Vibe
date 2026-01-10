import {
  createAgent,
  openai,
  createTool,
  createNetwork
} from "@inngest/agent-kit";

import { Sandbox } from "@e2b/code-interpreter";
import { inngest } from "./client";
import { getSandbox, lastMessage, runNextjsDevServer } from "./utils";
import { stdout } from "node:process";
import { z } from "zod";
import { PROMPT } from "@/prompt";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {

    const sandboxId = await step.run("create sandbox", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-v12");
      return sandbox.sandboxId;
    });

    const codeAgent = createAgent({
      name: "Code Agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: openai({
        model: "gpt-4.1-mini",
        defaultParameters: { temperature: 0.1 },
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, {step}) => {
            return await step?.run("terminal", async () => {
              const buffers = {stdout: "", stderr: ""}
              try {
                const sandbox = await getSandbox(sandboxId);
                await sandbox.commands.run(command, {
                  onStdout: (data) => {
                    stdout.write(data);
                    buffers.stdout += data;
                  },
                  onStderr: (data) => {
                    stdout.write(data);
                    buffers.stderr += data;
                  }

                });
                return {
                  stdout: buffers.stdout,
                  stderr: buffers.stderr,
                };

              } catch (error) {
                console.error(`Command failed: ${error} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`);
                return `Command failed: ${error} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`
              }
            });          
          },
        }),
        createTool({
          name: "createorUpdateFile",
          description: "Create or update a file in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),


          }),
          handler: async ({ files }, {step, network}) => {
            const newFiles = await step?.run("createorUpdateFile", async () => {
              try {
                const updatedFiles =
                  (network.state.data.files as Record<string, string>) ?? {};
                const sandbox = await getSandbox(sandboxId);
                for (const file of files) {
                  const resolvedPath = file.path.startsWith("/")
                    ? file.path
                    : `/home/user/app/${file.path.replace(/^app\//, "")}`;

                  await sandbox.files.write(resolvedPath, file.content);
                  console.log("📝 Writing file:", resolvedPath);
                  updatedFiles[resolvedPath] = file.content;
                }

                return updatedFiles;
              } catch (error) {
                console.error(`File creation/update failed: ${error}`);
                return `File creation/update failed: ${error}`;
              }
            });
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "readFile",
          description: "Read a file from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async({files},{step} ) =>{

            return await step?.run("readFile", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents= []
                for (const file of files){
                  const content = await sandbox.files.read(file);
                  contents.push({path: file, content});
                }
                return  JSON.stringify(contents);

              } catch (error) {
                return `Error reading files: ${error}`
              }
            });
          }
        }),
      ],
      lifecycle: {
        onResponse: async ({result, network}) => {
          const lastMessageContent = await lastMessage(result);

          if (lastMessageContent && network) {
            if (lastMessageContent.includes("<task_summary")) {
              network.state.data.summary = lastMessageContent;
            }
          }
          return result;
        }
      }
    });

    const network = createNetwork({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary){
          return ;
        }
        return codeAgent;
      },
    })

    const result = await network.run (event.data.value);

    const sandbox = await getSandbox(sandboxId);

    // await step.run("write generated page", async () => {
    //   await sandbox.files.write(
    //     "/home/user/app/page.tsx",
    //     output
    //   );
    // });

    const sandboxUrl = await step.run("start nextjs dev server", async () => {
      return await runNextjsDevServer(sandbox, {
        cwd: "/home/user",
        port: 3000,
      });
    });

    console.log("Sandbox URL:", sandboxUrl);

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
