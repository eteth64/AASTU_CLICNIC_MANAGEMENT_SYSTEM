const fs = require('fs');
const connection = require('./config/database'); // Import the existing connection

// Read the SQL file
const sql = fs.readFileSync('./init_db.sql', 'utf8');

// Execute the SQL file
connection.query(sql, (err, results) => {
  if (err) {
    console.error('Error initializing database:', err);
    connection.end();
    return;
  }
  console.log('Database initialized successfully');
  connection.end();
});