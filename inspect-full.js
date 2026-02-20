const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:42phinaH@localhost:5432/adrian_cims'
});

async function inspectDatabase() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to database\n');

    // 1. List all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📊 Tables in database:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    console.log('');

    // 2. Inspect User table columns
    try {
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'User'
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 Columns in User table:');
      if (columns.rows.length === 0) {
        console.log('  No columns found for User table');
      } else {
        columns.rows.forEach(col => {
          console.log(`  • ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
        });
      }
    } catch (e) {
      console.log('❌ Could not query User table columns:', e.message);
    }
    console.log('');

    // 3. Count rows in User table
    try {
      const count = await client.query('SELECT COUNT(*) FROM "User"');
      console.log(`👥 Total users: ${count.rows[0].count}`);
      
      if (parseInt(count.rows[0].count) > 0) {
        // 4. Get a sample user
        const sample = await client.query('SELECT * FROM "User" LIMIT 1');
        console.log('\n📝 Sample user data:');
        console.log(sample.rows[0]);
      }
    } catch (e) {
      console.log('❌ Could not query User table:', e.message);
    }

    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

inspectDatabase();
