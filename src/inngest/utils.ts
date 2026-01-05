import Sandbox from "@e2b/code-interpreter";

/**
 * Connects to the sandbox identified by `sandboxId` and returns the connected instance.
 *
 * @param sandboxId - Identifier of the sandbox to connect to
 * @returns The connected Sandbox instance
 */
export async function getSandbox(sandboxId: string) {
    const sandbox = await Sandbox.connect(sandboxId);
    return sandbox;
}


/**
 * Starts a Next.js development server inside the provided Sandbox and returns the host reachable for the server port.
 *
 * @param sandbox - The Sandbox instance in which to start the server.
 * @param options - Optional settings.
 * @param options.cwd - Working directory inside the sandbox where `npm run dev` will be executed (default: `/home/user`).
 * @param options.port - Port the dev server listens on inside the sandbox (default: `3000`).
 * @param options.timeoutMs - Maximum time to wait for the server to become reachable in milliseconds (default: `60000`).
 * @returns The host address for the dev server port as returned by `sandbox.getHost(port)`.
 * @throws Error if the server does not become reachable before `timeoutMs` elapses.
 */
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