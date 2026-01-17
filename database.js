const { Pool } = require('pg');

// Create a pool of connections
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10, // optional: maximum number of connections
    idleTimeoutMillis: 10000, // 30s, optional: how long a client can sit idle
    connectionTimeoutMillis: 2000, // 2s, optional: wait for connection before failing
});

// Handle unexpected errors on idle clients
pool.on('error', (err) => {
    console.error('Unexpected error on idle DB client', err);
});

console.log('Database pool initialized');

module.exports = { pool };