"use client";
import { transpileJSX } from './babel-setup';
import React from 'react';

export default function CustomCodeSection({ code }: { code: string }) {
  let Comp = null;
  try {
    // Transpile JSX to JS
    let compiled = transpileJSX(code);
    // Remove trailing semicolon if present
    compiled = compiled.trim().replace(/;$/, '');
    // eslint-disable-next-line no-new-func
    Comp = new Function('React', `return (${compiled})`)(React);
  } catch (e) {
    return <div className="text-red-500">Error rendering custom code: {String(e)}</div>;
  }
  return typeof Comp === 'function' ? <Comp /> : null;
} 