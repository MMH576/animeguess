This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

This project is configured for deployment on Vercel. Follow these steps to deploy:

1. **Push your code to a GitHub repository**

2. **Connect to Vercel**

   - Go to [Vercel](https://vercel.com) and sign up or log in
   - Click "Add New" > "Project"
   - Import your GitHub repository
   - Select the repository where you pushed your code

3. **Configure Environment Variables**
   Add the following environment variables in the Vercel dashboard:

   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `NEXT_PUBLIC_SITE_URL` - Your Vercel deployment URL (e.g., https://your-app-name.vercel.app)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key (if using Clerk)
   - `CLERK_SECRET_KEY` - Your Clerk secret key (if using Clerk)

4. **Deploy**

   - Click "Deploy"
   - Vercel will automatically build and deploy your project

5. **Custom Domain (Optional)**

   - In the Vercel dashboard, go to your project
   - Click on "Domains"
   - Add your custom domain and follow the instructions

6. **Continuous Deployment**
   - Any commits to your main branch will trigger automatic deployments
   - You can configure deployment settings in the Vercel dashboard

Check out [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
