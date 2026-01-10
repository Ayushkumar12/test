const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    console.log('Login successful:', response.data);
    console.log('User role:', response.data.user.role);

    const token = response.data.token;

    console.log('\nTesting admin stats endpoint...');
    const statsResponse = await axios.get('http://localhost:5000/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Stats:', statsResponse.data);

    console.log('\nTesting admin users endpoint...');
    const usersResponse = await axios.get('http://localhost:5000/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Users count:', usersResponse.data.length);

    console.log('\nTesting admin questions endpoint...');
    const questionsResponse = await axios.get('http://localhost:5000/api/admin/questions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Questions count:', questionsResponse.data.length);

    console.log('\nTesting admin attempts endpoint...');
    const attemptsResponse = await axios.get('http://localhost:5000/api/admin/attempts', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Attempts count:', attemptsResponse.data.length);

    console.log('\nAll admin endpoints working correctly!');
  } catch (error) {
    console.error('Test failed:', error.response ? error.response.data : error.message);
  }
}

testAdminLogin();
