import React from 'react';
import { Metadata } from 'next';
import ProductsPageClient from './ProductsPageClient';

export const metadata: Metadata = {
  title: 'Our Products',
  description: 'Explore our range of products and services',
};

export default function ProductsPage() {
  return <ProductsPageClient />;
}
