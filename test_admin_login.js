const axios = require('axios');

async function testAdminLogin() {
  try {
    const response = await axios.post('http://localhost:5000/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    console.log('Login successful:', response.data);
    console.log('User role:', response.data.user.role);
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
  }
}

testAdminLogin();
