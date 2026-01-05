import {
  createAgent,
  openai,
} from "@inngest/agent-kit";

import { Sandbox } from "@e2b/code-interpreter";
import { inngest } from "./client";
import { getSandbox, runNextjsDevServer } from "./utils";

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
      system:
        "you are an expert Next.js Developer. Given a prompt, output the full code for a Next.js page or component.",
      model: openai({ model: "gpt-4o" }),
    });

    const { output } = await codeAgent.run(
      `Write the following code:\n${event.data.value}`
    );

    console.log("Generated code:", output);

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
      sandboxId,
      sandboxUrl,
    };
  }
);
