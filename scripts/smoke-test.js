(async () => {
  try {
    const email = `smoke+${Date.now()}@example.com`;
    const name = 'Smoke Test';
    const password = 'password123';
    const base = 'http://localhost:3000/api/v1/auth';

    const regRes = await fetch(`${base}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const regBody = await regRes.text();
    console.log('REGISTER_STATUS', regRes.status);
    console.log('REGISTER_BODY', regBody);

    const loginRes = await fetch(`${base}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginBody = await loginRes.text();
    console.log('LOGIN_STATUS', loginRes.status);
    console.log('LOGIN_BODY', loginBody);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
