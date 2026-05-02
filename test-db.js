const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/bsthub.db');

db.all('SELECT * FROM orders', [], (err, rows) => {
  if (err) console.error(err);
  console.log("ORDERS:", rows);
});

db.all('SELECT * FROM payments', [], (err, rows) => {
  if (err) console.error(err);
  console.log("PAYMENTS:", rows);
});
