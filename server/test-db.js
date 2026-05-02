const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('bsthub.db');

db.all('SELECT * FROM users', [], (err, rows) => {
  if (err) console.error(err);
  console.log("USERS:", rows);
});
