'use client';

export default function EnvTest() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Environment Variables Test</h1>
      <div style={{ marginTop: '1rem', fontFamily: 'monospace' }}>
        <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
        <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</p>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <p>If the Supabase URL is not showing or the key shows as not set, please verify your <code>.env.local</code> file contains these variables:</p>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
          {`NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
        </pre>
      </div>
    </div>
  );
}
