const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files and directories to remove
const filesToRemove = [
  'lib/subscription-service.server.ts',
  'app/api/webhooks/stripe/route.ts',
  'app/api/create-checkout-session/route.ts',
  'app/api/create-portal-session/route.ts',
  'app/api/webhooks/stripe/route.ts',
  'app/billing/page.tsx',
  'app/checkout/page.tsx',
  'app/checkout/success/page.tsx',
  'components/billing/billing-plans.tsx',
  'components/billing/subscription-status.tsx',
];

// Remove files
console.log('Removing Stripe-related files...');
filesToRemove.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Removed: ${file}`);
  }
});

// Remove Stripe from package.json
console.log('Updating package.json...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Remove Stripe dependencies
const stripDeps = ['@stripe/stripe-js', 'stripe'];
Object.keys(packageJson.dependencies).forEach(dep => {
  if (stripDeps.includes(dep)) {
    delete packageJson.dependencies[dep];
  }
});

// Save updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Running npm install to update dependencies...');
execSync('npm install', { stdio: 'inherit' });

console.log('\nStripe integration has been removed. Please check the following:');
console.log('1. Review and remove any Stripe-related environment variables in .env.local');
console.log('2. Apply the database migration to remove Stripe-related tables and columns');
console.log('3. Test the application to ensure all Stripe functionality has been removed');

console.log('\nTo apply the database migration, run:');
console.log('npx supabase db reset');
console.log('\nOr apply the specific migration:');
console.log('npx supabase migration up');
