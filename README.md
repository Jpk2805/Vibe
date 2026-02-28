# Vibe - AI Website Builder

> **Live Demo:** [https://vibe-beta-eight.vercel.app/](https://vibe-beta-eight.vercel.app/)

Vibe is an AI-powered website builder that allows users to seamlessly generate, preview, and iterate on Next.js web applications using natural language. Under the hood, Vibe utilizes an AI agent workflow to write the code and instantly spins up isolated Next.js runtime environments using E2B Sandboxes to provide live, interactive previews.

## 🚀 Features

- **AI Code Generation**: Employs OpenAI's latest models via the AI SDK and Inngest Agent Kit to intelligently write full-stack React and Next.js code.
- **Live Interactive Previews**: Instantly boots up a secure, isolated Next.js environment inside an E2B Sandbox to render the generated website.
- **Project Workspaces**: Projects and generated code files are rigorously preserved and can be restored at any time.
- **Secure Authentication**: Built with Clerk to handle user accounts and protected routes smoothly.
- **Modern Stack**: Built tightly with Next.js 15 (App Router), tRPC, Prisma, and Tailwind CSS.
- **Background Jobs**: Uses Inngest to handle long-running LLM tasks and sandbox orchestration asynchronously, ensuring a highly responsive user experience.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [Neon Postgres](https://neon.tech/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [Clerk](https://clerk.com/)
- **API Engine**: [tRPC](https://trpc.io/) & React Query
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) (Radix)
- **Background Jobs**: [Inngest](https://www.inngest.com/)
- **Sandboxing**: [E2B Code Interpreter](https://e2b.dev/)
- **AI**: [OpenAI](https://openai.com/)

## 💻 Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/en/) (v20 or higher recommended)
- npm, yarn or pnpm
- PostgreSQL Database (e.g., Neon)

### Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd vibe
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and populate it with your API keys:

   ```env
   # Database (Neon/Postgres)
   DATABASE_URL="postgresql://..."

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
   CLERK_SECRET_KEY="..."

   # OpenAI
   OPENAI_API_KEY="..."

   # E2B Sandbox
   E2B_API_KEY="..."

   # Inngest
   INNGEST_EVENT_KEY="..."
   INNGEST_SIGNING_KEY="..."
   ```

4. **Initialize the Database**
   Generate the Prisma client and push the schema to your database.

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Development Server**
   To run the application locally, you need to start both the Next.js server and the Inngest local dev server.

   In **Terminal 1**:

   ```bash
   npm run dev
   ```

   In **Terminal 2**:

   ```bash
   npx inngest-cli dev
   ```

6. **Open the App**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is licensed under the MIT License.
