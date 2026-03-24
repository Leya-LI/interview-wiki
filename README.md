# 🚀 Interview Wiki

[![Deployed on Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://interview-wiki-lac.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)

**Interview Wiki** is an AI-powered interview preparation and feedback platform. It leverages artificial intelligence to provide users with actionable insights, helping candidates refine their interview skills, structure their answers, and build confidence through an interactive, modern web interface.

🌐 **Live Demo:** [interview-wiki-lac.vercel.app]([https://interview-wiki-lac.vercel.app](https://interview-wiki-lac.vercel.app/))



## ✨ Key Features

* **🤖 AI-Driven Feedback:** Get intelligent, contextual feedback on your interview responses to improve structure, clarity, and impact.
* **⚡️ Lightning-Fast Performance:** Built with Vite for rapid cold starts, instant hot module replacement (HMR), and an optimized build process.
* **🔒 End-to-End Type Safety:** Fully written in TypeScript, ensuring robust code sharing between the client and server.
* **🗄️ Modern Data Management:** Utilizes Drizzle ORM for type-safe database queries and seamless schema migrations.
* **💅 Intuitive UI/UX:** Styled with Tailwind CSS and `shadcn/ui` components for a clean, accessible, and highly customizable user experience.


## 🛠️ Tech Stack

**Frontend:**
* **Framework:** React + Vite
* **Language:** TypeScript
* **Styling:** Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/)
* **Routing & State:** React Router / React Query (assumed based on standard stack)

**Backend & Data:**
* **Runtime:** Node.js
* **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/)
* **Architecture:** Monorepo-style structure separating `client`, `server`, and `shared` logic.

**Infrastructure:**
* **Deployment:** Vercel (Configured via `vercel.json`)
* **Package Manager:** npm / pnpm


## 📂 Project Structure

```text
interview-wiki/
├── api/                # Serverless functions or API route handlers
├── attached_assets/    # Static assets, media, and design resources
├── client/             # Frontend React application (components, pages, hooks)
├── script/             # Automation, database migration, and build scripts
├── server/             # Backend Node.js service (controllers, core logic)
├── shared/             # Shared TypeScript types, schemas, and constants
├── types/              # Global TypeScript declaration files
├── components.json     # Configuration for shadcn/ui
├── drizzle.config.ts   # Configuration for Drizzle ORM
├── vercel.json         # Deployment configuration for Vercel
└── vite.config.ts      # Build tool configuration
````


## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1\. Clone the Repository

```bash
git clone [https://github.com/Leya-LI/interview-wiki.git](https://github.com/Leya-LI/interview-wiki.git)
cd interview-wiki
```

### 2\. Install Dependencies

```bash
npm install
# or if using pnpm
# pnpm install
```

### 3\. Environment Variables

Create a `.env` file in the root directory and configure your necessary environment variables (e.g., Database URL, AI API keys).

```bash
cp .env.example .env
```

*(Note: Ensure you have populated the `.env` file with your actual local or remote database credentials before proceeding.)*

### 4\. Database Setup

Push the Drizzle schema to your database:

```bash
npm run db:push
# Check your package.json for the exact script name
```

### 5\. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port specified in your terminal).

-----

## ☁️ Deployment

This project is optimized for deployment on **Vercel**.

1.  Push your code to your GitHub repository.
2.  Log in to [Vercel](https://vercel.com/) and create a new project.
3.  Import the `Leya-LI/interview-wiki` repository.
4.  Add your production environment variables (Database URL, API keys, etc.) in the Vercel dashboard.
5.  Click **Deploy**. Vercel will automatically detect the build settings via `vercel.json` and deploy your app.


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.
