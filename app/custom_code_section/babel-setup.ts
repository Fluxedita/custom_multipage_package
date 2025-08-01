import * as Babel from '@babel/standalone';

export function transpileJSX(code: string): string {
  return Babel.transform(code, {
    presets: ['react', 'typescript'],
    filename: 'file.tsx', // <-- Add this line
  }).code || '';
} 