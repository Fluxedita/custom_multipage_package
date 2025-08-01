const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files and directories to remove
const filesToRemove = [
  'lib/subscription-service.server.ts',
  'app/api/webhooks/stripe/route.ts',
  'app/api/create-checkout-session/route.ts',
  'app/api/create-portal-session/route.ts',
  'app/billing',
  'app/checkout',
  'components/billing',
  'components/subscription',
];

// Remove files and directories
console.log('Removing Stripe-related files and directories...');
filesToRemove.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    if (fs.lstatSync(filePath).isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
      console.log(`Removed directory: ${file}`);
    } else {
      fs.unlinkSync(filePath);
      console.log(`Removed file: ${file}`);
    }
  }
});

// Remove Stripe from package.json
console.log('Updating package.json...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Remove Stripe dependencies
const stripeDeps = ['@stripe/stripe-js', 'stripe'];
Object.keys(packageJson.dependencies).forEach(dep => {
  if (stripeDeps.includes(dep)) {
    delete packageJson.dependencies[dep];
    console.log(`Removed dependency: ${dep}`);
  }
});

// Save updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Remove Stripe-related environment variables from .env.local
console.log('Updating .env.local...');
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const updatedEnv = envContent
    .split('\n')
    .filter(line => !line.trim().startsWith('STRIPE_'))
    .join('\n');
  fs.writeFileSync(envPath, updatedEnv);
}

console.log('Running npm install to update dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('Dependencies updated successfully.');
} catch (error) {
  console.error('Error updating dependencies:', error.message);
}

console.log('\nStripe integration has been removed. Next steps:');
console.log('1. Apply the database migration to remove Stripe-related tables and columns');
console.log('2. Test the application to ensure all Stripe functionality has been removed');
console.log('\nTo apply the database migration, run:');
console.log('npx supabase db reset');
console.log('\nOr apply the specific migration:');
console.log('npx supabase migration up');
