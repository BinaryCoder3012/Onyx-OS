const { execSync } = require('child_process');

const dbUrl = process.env.DATABASE_URL || '';

if (dbUrl.startsWith('postgres:') || dbUrl.startsWith('postgresql:')) {
  console.log('PostgreSQL database URL detected. Synchronizing database schema with prisma db push...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('Database schema synchronized successfully.');
  } catch (err) {
    console.error('Error executing prisma db push:', err.message);
    process.exit(1);
  }
} else {
  console.log('No production PostgreSQL DATABASE_URL detected (currently using: ' + (dbUrl || 'none') + '). Skipping database schema push.');
}
