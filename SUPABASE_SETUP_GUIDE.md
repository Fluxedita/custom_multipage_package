# Supabase Setup Guide

This guide provides step-by-step instructions for setting up and connecting to a Supabase database in a Next.js application.

## Prerequisites
- Node.js and npm installed
- A Supabase account (https://supabase.com/)
- Basic knowledge of SQL and Next.js

## 1. Create a New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Enter your project details:
   - Name your project
   - Set a secure database password (save this in a secure place)
   - Choose a region closest to your users
4. Click "Create new project"

## 2. Set Up Environment Variables

1. In your Next.js project, create or update `.env.local` with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. Find these values in your Supabase project:
   - Go to Project Settings > API
   - Copy the Project URL to `NEXT_PUBLIC_SUPABASE_URL`
   - Copy the `anon` public key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy the `service_role` key to `SUPABASE_SERVICE_ROLE_KEY`

## 3. Install Required Packages

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

## 4. Set Up Supabase Client

Create `lib/supabaseClient.js`:

```javascript
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createBrowserSupabaseClient();
```

## 5. Test the Connection

Create `app/test-connection/page.jsx`:

```jsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestConnection() {
  const [status, setStatus] = useState('Testing connection...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        setStatus('✅ Successfully connected to Supabase!');
      } catch (err) {
        setError(err.message);
        setStatus('❌ Connection failed');
      }
    };
    testConnection();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Supabase Connection Test</h1>
      <p>Status: {status}</p>
      {error && <pre style={{ color: 'red' }}>Error: {error}</pre>}
    </div>
  );
}
```

## 6. Initialize Database Schema (Optional)

1. Go to the SQL Editor in your Supabase dashboard
2. Create tables and relationships
3. Set up Row Level Security (RLS) policies

## 7. Common Issues & Solutions

### Connection Issues
- **Error: Invalid API Key**
  - Verify your environment variables are correctly set
  - Ensure there are no typos in the keys
  - Restart your Next.js dev server after changing environment variables

### Database Issues
- **Missing Tables**
  - Check if migrations were applied
  - Verify table names in your queries

### Authentication Issues
- **Session Problems**
  - Ensure proper auth flow implementation
  - Check RLS policies if getting permission errors

## 8. Next Steps
- Set up authentication flows
- Create API routes for server-side operations
- Implement real-time subscriptions

## 9. Additional Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client Reference](https://supabase.com/docs/reference/javascript/initializing)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

## Support
For additional help, refer to the official [Supabase Documentation](https://supabase.com/docs) or [GitHub Issues](https://github.com/supabase/supabase/issues).
