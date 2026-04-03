// keep-alive.ts
import https from 'https';

const URL = 'https://smart-inventory-order-management-system-1h6n.onrender.com/test';

function ping(): void {
  https.get(URL, (res) => {
    console.log(`[${new Date().toISOString()}] Status: ${res.statusCode}`);
  }).on('error', (err: Error) => {
    console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
  });
}

setInterval(ping, 10 * 60 * 1000);

ping();