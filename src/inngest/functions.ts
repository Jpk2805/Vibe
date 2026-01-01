import {
  createNetwork,
  createAgent,
  openai,
} from "@inngest/agent-kit";

import { inngest } from "./client";
import { success } from "zod";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {



  const codeAgent = createAgent({ 
      name: 'Code Agent',
      system:
        'you are an expert Next.js Developer.  Given a set of asks, you think step-by-step to plan clean, ' +
        'and efficient code to solve the problem. You then write the code in a single block.', 
      model: openai({ model: "gpt-4o" }),
    });

    const {output} = await codeAgent.run(
      `Write the following code: ${event.data.value}`


    );
    console.log("Summary:", output);
    
    return {output};
  },
);