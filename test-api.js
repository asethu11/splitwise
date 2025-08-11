// Simple test script for the join API
// Run with: node test-api.js

const testJoinAPI = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inviteCode: 'TEST123',
        displayName: 'Test User'
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ API test successful!');
    } else {
      console.log('❌ API test failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  testJoinAPI();
}

module.exports = { testJoinAPI };
