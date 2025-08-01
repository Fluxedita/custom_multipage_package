"use client";
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function CustomCodeSectionEditor({ code, onChange }: { code: string, onChange: (code: string) => void }) {
  return (
    <div style={{ height: 300 }}>
      <MonacoEditor
        language="javascript"
        value={code}
        onChange={value => onChange(value || '')}
        options={{ minimap: { enabled: false } }}
      />
    </div>
  );
} 