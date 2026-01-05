import path from 'path'
import dotenv from 'dotenv'

// Load repo-root .env (two levels up from this file)
dotenv.config({ path: path.join(__dirname, '../../.env') })

if (!process.env.E2B_API_KEY) {
  console.error('Missing E2B_API_KEY. Set it in the repo `.env` or in your shell. Example (PowerShell):\n  $env:E2B_API_KEY="e2b_<your_key>"; npx tsx build.dev.ts --cmd "/compile_page.sh"\nOr (bash):\n  export E2B_API_KEY="e2b_<your_key>"; npx tsx build.dev.ts --cmd "/compile_page.sh"\nSee: https://e2b.dev/docs/api-key')
  process.exit(1)
}
import { Template, defaultBuildLogger } from 'e2b'
import { template } from './template'

async function main() {
  await Template.build(template, {
    alias: 'vibe-nextjs-v12',
    onBuildLogs: defaultBuildLogger(),
  });
}

main().catch(console.error);
