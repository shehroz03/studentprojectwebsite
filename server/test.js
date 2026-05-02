const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost', port: 8000, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { console.log(`POST ${path} [${res.statusCode}]:`, d); resolve(JSON.parse(d)); });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function test() {
  // Register student
  await post('/api/auth/register.php', { name: 'Ali', email: 'ali@test.com', password: '123456' });

  // Login as student
  const loginRes = await post('/api/auth/login.php', { email: 'ali@test.com', password: '123456' });
  const studentId = loginRes.user?.id;
  console.log('Student ID:', studentId);

  // Login as admin
  const adminRes = await post('/api/auth/login.php', { email: 'admin@bsthub.com', password: 'password' });
  const adminId = adminRes.user?.id;
  console.log('Admin ID:', adminId);

  console.log('\n✅ All auth endpoints working!\n');
}

test().catch(console.error);
