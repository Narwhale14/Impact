const { Client } = require('pg');

const db = new Client({ connectionString: process.env.DATABASE_URL });
db.connect() // connects
    .then(() => console.log('Connected to DB'))
    .catch(err => console.error('DB connection error: ', err))
    
module.exports = { db };