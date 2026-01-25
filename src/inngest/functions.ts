import {
  createAgent,
  openai,
  createTool,
  createNetwork,
  Tool,
  Message,
  createState
} from "@inngest/agent-kit";

import { Sandbox } from "@e2b/code-interpreter";
import { inngest } from "./client";
import { getSandbox, lastMessage, runNextjsDevServer } from "./utils";
import { stdout } from "node:process";
import { z } from "zod";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import prisma from "@/lib/db";
import path from "path";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {

    const sandboxId = await step.run("create sandbox", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-v12");
      return sandbox.sandboxId;
    });


    const previousMessages = await step.run("get-previous-messages", async () => {
      const formattedMessages: Message[] = []

      const messages = await prisma.message.findMany({
        where: {
          projectID : event.data.projectID
        },
        orderBy:{
          createdAt: 'desc'
        }
      })

      for (const message of messages){
        formattedMessages.push({
          type: "text",
          role: message.role === "USER" ? 'user' : 'assistant',
          content: message.content,
        })
      }

      return formattedMessages
    })

    const state = createState<AgentState>(
      {
        summary:'',
        files:{},
      },
      {
        messages: previousMessages,

      }
    )

    const codeAgent = createAgent<AgentState>({
      name: "Code Agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: openai({
        model: 'gpt-4.1',
        // defaultParameters: { temperature: 0.2 },
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
                throw new Error(`Command failed: ${error} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`);
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
          handler: async ({ files }, {step, network}: Tool.Options<AgentState>) => {
            const newFiles = await step?.run("createorUpdateFile", async () => {
              try {
                const updatedFiles =network.state.data.files || {};
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
                throw new Error(`File creation/update failed: ${error}`);
              }
            });
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "readFile",
          description: "Read files from the sandbox (directories are expanded)",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFile", async () => {
              const sandbox = await getSandbox(sandboxId);
              const WORKSPACE_ROOT = "/home/user";
        
              const results: { path: string; content: string }[] = [];
        
              async function readPath(inputPath: string) {
                // Normalize agent paths
                const rel = inputPath
                  .replace(/^\/root\/?/, "")
                  .replace(/^\/app\/?/, "app/")
                  .replace(/^\/+/, "");
        
                const abs = path.posix.join(WORKSPACE_ROOT, rel);
        
                // 1️⃣ Try reading as file
                try {
                  const content = await sandbox.files.read(abs);
                  results.push({ path: rel, content });
                  return;
                } catch {
                  // Not a file → probably a directory
                }
        
                // 2️⃣ Try listing as directory
                // Try listing as directory
                let entries;
                try {
                  entries = await sandbox.files.list(abs);
                } catch {
                  return;
                }

                for (const entry of entries) {
                  await readPath(path.posix.join(rel, entry.name));
                }

              }
        
              for (const file of files) {
                await readPath(file);
              }
        
              return results;
            });
          },
        })
        
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

    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      defaultState:state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary){
          return ;
        }
        return codeAgent;
      },
    })

    const result = await network.run (event.data.value, {state});

    const fragmentTitleGenerator = createAgent({
      name:"fragment-title-generatir",
      description:"A fragment Title generator",
      system:FRAGMENT_TITLE_PROMPT,
      model: openai({
        model:"gpt-4o-mini"
      }) 
    })

    const responseGenerator = createAgent({
      name:"response-generatir",
      description:"A response generator",
      system:RESPONSE_PROMPT,
      model: openai({
        model:"gpt-4o-mini"
      }) 
    })

    const {output: fragmentTitle} = await fragmentTitleGenerator.run(result.state.data.summary)
    const {output: response} = await responseGenerator.run(result.state.data.summary)

    const generateFragmentTitle = () =>{
      if(fragmentTitle[0].type !== "text"){
        return "Fragment"
      }

      if(Array.isArray(fragmentTitle[0].content)){
        return fragmentTitle[0].content.map((txt)=> txt).join('')
      }else{
        return fragmentTitle[0].content
      }
    }
    
    const generateResponse = () =>{
      if(response[0].type !== "text"){
        return "Response"
      }

      if(Array.isArray(response[0].content)){
        return response[0].content.map((txt)=> txt).join('')
      }else{
        return response[0].content
      }
    }

    const isError = 
    !result.state.data.summary ||
    Object.keys(result.state.data.files || {}).length === 0;

    if (isError){
      
    }
    await step.run("save-result", async () => {
      if(isError){
        return await prisma.message.create({
          data: {
            projectID: event.data.projectID,
            content: "The code agent failed to complete the task.",
            role: "ASSISTANT",
            type: "ERROR",
          }
        });
      }
    });

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

    await step.run("save-results", async () => {
      await prisma.message.create({
        data: {
          projectID: event.data.projectID,
          content: generateResponse(),
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: generateFragmentTitle(),
              files: result.state.data.files,
            }
            
          }
        },
      });
    });

    console.log("Sandbox URL:", sandboxUrl);

    return {
      url: sandboxUrl,
      title: fragmentTitle[0].type === "text" ? fragmentTitle[0].content : "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
