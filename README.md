# Splitwise Clone

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. In the SQL editor, run the schema from `schema.sql` (ensure RLS is OFF)
3. Copy your **Project URL** and **Service Role Key** from the project settings
4. Create a `.env.local` file in the root directory with:

```bash
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
APP_URL=http://localhost:3000
```

## Getting Started

First, set up your environment variables as described above, then run the development server:

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

## Testing

Run the test suite:

```bash
pnpm test
```

For CI environments, use:

```bash
pnpm test --run
```

The test suite includes:
- **Settle utility tests**: Comprehensive tests for the minimum cash flow algorithm
- **Schema validation tests**: Tests for data validation schemas
- **Edge cases**: Rounding errors, epsilon tolerance, complex scenarios

## API Testing

Once your environment is set up, you can test the join API:

```bash
curl -X POST http://localhost:3000/api/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode": "ABC123", "displayName": "John Doe"}'
```

This should return `{"roomId": "..."}` and set a cookie for the user.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load the Geist font family.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!


