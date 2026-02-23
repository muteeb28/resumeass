import pg from 'pg';
const { Pool } = pg;

let pool;

export const connectDB = async () => {
  if (pool) return pool;

  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    const client = await pool.connect();
    console.log('🚀 Connected to Neon PostgreSQL via pg Pool');

    // Create users table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Drop old portfolios table if schema is outdated (no slug column)
    const { rows: slugCheck } = await client.query(`
          SELECT column_name FROM information_schema.columns
          WHERE table_name = 'portfolios' AND column_name = 'slug'
        `);
    if (slugCheck.length === 0) {
      await client.query(`DROP TABLE IF EXISTS portfolios`);
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS portfolios (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        data JSONB NOT NULL,
        theme VARCHAR(50) DEFAULT 'default',
        published BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "hrIndianLists" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255),
        company VARCHAR(255),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "jobApplications" (
        id SERIAL PRIMARY KEY,
        company VARCHAR(255),
        title VARCHAR(255) UNIQUE,
        status VARCHAR(50),
        link TEXT,
        contact TEXT,
        date VARCHAR(100),
        stage VARCHAR(50),
        custom JSONB,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    client.release();
  } catch (error) {
    console.error('❌ Neon Connection Error:', error.message);
  }
};

export const getPool = () => {
  if (!pool) throw new Error('Database pool not initialized. Call connectDB() first.');
  return pool;
};

export default { connectDB, getPool };
