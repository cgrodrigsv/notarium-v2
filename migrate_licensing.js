const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'prisma', 'dev.db'));

try {
  // Check if columns already exist
  const cols = db.pragma('table_info(User)').map(c => c.name);
  
  if (!cols.includes('planType')) {
    db.exec("ALTER TABLE User ADD COLUMN planType TEXT NOT NULL DEFAULT 'NONE'");
    console.log('Added planType');
  } else {
    console.log('planType already exists, skipping');
  }
  
  if (!cols.includes('examsRemaining')) {
    db.exec("ALTER TABLE User ADD COLUMN examsRemaining INTEGER NOT NULL DEFAULT 0");
    console.log('Added examsRemaining');
  } else {
    console.log('examsRemaining already exists, skipping');
  }
  
  if (!cols.includes('trialExpiresAt')) {
    db.exec("ALTER TABLE User ADD COLUMN trialExpiresAt DATETIME");
    console.log('Added trialExpiresAt');
  } else {
    console.log('trialExpiresAt already exists, skipping');
  }

  console.log('Migration completed successfully');
} catch (err) {
  console.error('Migration error:', err.message);
} finally {
  db.close();
}
