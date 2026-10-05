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

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy on Netlify

1. Push this project to GitHub or another Git provider.
2. In Netlify, choose **Add new site** and import the repository.
3. Keep the detected build command as `npm run build` and deploy.
4. Add the Supabase project URL and publishable/anon key in Netlify site environment variables. `NEXT_PUBLIC_SUPABASE_URL` must look like `https://your-project.supabase.co`; it is not the `sb_publishable_...` key. Use the same values in local `.env.local`.

## Supabase shared uploads

Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor. It creates the shared content and gallery tables, student-enrollment and donation-slip tables, the public `temple-media` bucket, a private `donation-slips` bucket, and their row-level security policies.

Create each admin user in Supabase under **Authentication → Users**. In that user's **App Metadata**, set `admin_role` to `super_admin`, `editor`, or `dhamma_admin`, then sign in with that email and password. Do not put role values in User Metadata; users can edit that metadata themselves.

To set a role from the Supabase SQL Editor, replace the email and role below with the desired admin account and role:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"admin_role":"super_admin"}'::jsonb
where email = 'admin@example.com';
```

Sign out and back in after changing the role so the new role is included in the Supabase session.

Admin content changes sync to Supabase; they are not written to browser localStorage. Existing browser content may be read as a one-time legacy fallback when no cloud value exists, but a successful Supabase save is required for the changes to be shared. The admin dashboard shows cloud-sync status and any save errors. Donation slips are stored in a private bucket and only a super admin can review them. Student applications and their statuses are shared through Supabase.
