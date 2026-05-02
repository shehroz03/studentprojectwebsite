const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'bsthub.db'));

async function setAdmin() {
  const email = 'miansabmi7@gmail.com';
  const password = '12345six@';
  const name = 'BST Admin';
  const hash = await bcrypt.hash(password, 10);

  // Delete old admin
  db.run('DELETE FROM users WHERE role = "admin"', [], (err) => {
    if (err) console.error(err);

    // Insert new admin
    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "admin")',
      [name, email, hash],
      function(err) {
        if (err) {
          // If email exists, just update it
          db.run(
            'UPDATE users SET password = ?, role = "admin", name = ? WHERE email = ?',
            [hash, name, email],
            (err2) => {
              if (err2) console.error('Error:', err2.message);
              else console.log('✅ Admin updated: ' + email);
              db.close();
            }
          );
        } else {
          console.log('✅ Admin created successfully!');
          console.log('   Email:    ' + email);
          console.log('   Password: ' + password);
          console.log('   ID:       ' + this.lastID);
          db.close();
        }
      }
    );
  });
}

setAdmin();
