const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.prisma');
const target = process.argv[2];

if (!['sqlite', 'postgres'].includes(target)) {
  console.error('Usage: node use-db.js <sqlite|postgres>');
  process.exit(1);
}

let content = fs.readFileSync(schemaPath, 'utf8');

if (target === 'sqlite') {
  console.log('Switching to SQLite...');
  content = content.replace(
    /datasource db \{[\s\S]*?\}/,
    `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`
  );
} else {
  console.log('Switching to PostgreSQL...');
  content = content.replace(
    /datasource db \{[\s\S]*?\}/,
    `datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_URL_UNPOOLED")
}`
  );
}

fs.writeFileSync(schemaPath, content);
console.log('Done! Now run: npx prisma generate');
