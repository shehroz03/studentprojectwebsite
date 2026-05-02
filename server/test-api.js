const http = require('http');

http.get('http://localhost:8000/api/admin/orders.php', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('ORDERS API:', data));
}).on('error', err => console.log('ERR:', err.message));

http.get('http://localhost:8000/api/payments/list.php', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('PAYMENTS API:', data));
}).on('error', err => console.log('ERR:', err.message));
