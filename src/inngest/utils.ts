import Sandbox from "@e2b/code-interpreter";

export async function getSandbox(sandboxId: string) {
    const sandbox = await Sandbox.connect(sandboxId);
    return sandbox;
}


export async function runNextjsDevServer(
  sandbox: Sandbox,
  options?: {
    cwd?: string;
    port?: number;
    timeoutMs?: number;
  }
) {
  const cwd = options?.cwd ?? "/home/user";
  const port = options?.port ?? 3000;
  const timeoutMs = options?.timeoutMs ?? 60_000;


  await sandbox.commands.run("npm run dev", {
    cwd,
    background: true,
  });

  const start = Date.now();
  while (true) {
    try {
      await sandbox.commands.run(
        `curl -sSf http://localhost:${port} > /dev/null`
      );
      break; // success
    } catch {
      if (Date.now() - start > timeoutMs) {
        throw new Error("Next.js server did not start in time");
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return sandbox.getHost(port);
}