import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import supabase from '@/lib/supabase/client';

export function usePageData() {
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const editMode = searchParams?.get('edit') === 'true';

  useEffect(() => {
    async function fetchHomePageContent() {
      try {
        const { data, error } = await supabase
          .from('custom_pages')
          .select('id, slug')
          .eq('slug', 'home')
          .single();

        if (error) throw error;

        if (data) {
          const { data: content, error: contentError } = await supabase
            .from('page_content')
            .select('*')
            .eq('page_id', data.id)
            .single();

          if (contentError) throw contentError;
          setPageData(content);
        }
      } catch (err) {
        console.error('Error fetching page data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchHomePageContent();
  }, []);

  return { pageData, loading, error, editMode };
} 