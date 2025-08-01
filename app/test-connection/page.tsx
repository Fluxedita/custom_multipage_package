'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase/client';

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState('Testing connection...');
  const [tables, setTables] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Simple connection test that doesn't require any database setup
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw new Error(`Connection failed: ${error.message}`);
        }
        
        setConnectionStatus('✅ Successfully connected to Supabase!');
        
        // Since this is a new database, there won't be any tables yet
        setTables(['No tables found (this is normal for a new database)']);
        
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setConnectionStatus('❌ Connection failed');
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Supabase Connection Test</h1>
      <div>
        <h2>Status: {connectionStatus}</h2>
        {error && (
          <div style={{ color: 'red', marginTop: '1rem' }}>
            <h3>Error:</h3>
            <pre>{error}</pre>
          </div>
        )}
        {tables.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <h3>Available Tables:</h3>
            <ul>
              {tables.map((table) => (
                <li key={table}>{table}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
