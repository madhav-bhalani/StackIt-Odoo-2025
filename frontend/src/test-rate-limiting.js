// Test script to verify rate limiting and caching functionality
// This can be run in the browser console to test API caching

const testRateLimiting = async () => {
  console.log('🚦 Testing Rate Limiting and Caching...\n');
  
  // Test 1: Check if caching is working for auth API
  console.log('1. Testing auth API caching:');
  
  const startTime = Date.now();
  
  try {
    // First call - should hit the server
    console.log('   Making first auth call...');
    const response1 = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('   First call status:', response1.status);
    
    // Second call - should use cache
    console.log('   Making second auth call (should be cached)...');
    const response2 = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('   Second call status:', response2.status);
    
  } catch (error) {
    console.log('   ❌ Auth API test failed:', error);
  }
  
  // Test 2: Check if caching is working for questions API
  console.log('\n2. Testing questions API caching:');
  
  try {
    // First call - should hit the server
    console.log('   Making first questions call...');
    const response1 = await fetch('/api/questions?sortBy=createdAt&order=desc&limit=20');
    console.log('   First call status:', response1.status);
    
    // Second call - should use cache
    console.log('   Making second questions call (should be cached)...');
    const response2 = await fetch('/api/questions?sortBy=createdAt&order=desc&limit=20');
    console.log('   Second call status:', response2.status);
    
  } catch (error) {
    console.log('   ❌ Questions API test failed:', error);
  }
  
  const endTime = Date.now();
  console.log(`\n⏱️ Total test time: ${endTime - startTime}ms`);
  
  console.log('\n✅ Rate limiting and caching test completed!');
  console.log('💡 Check the Network tab in DevTools to see if requests are being cached.');
  console.log('💡 Look for "📦 Using cached" messages in the console.');
};

const testAuthenticationFlow = () => {
  console.log('🔐 Testing Authentication Flow...\n');
  
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  
  console.log('1. Current authentication state:');
  console.log('   Token exists:', !!token);
  console.log('   Stored user exists:', !!storedUser);
  
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      console.log('   User data:', {
        id: user.id,
        name: user.name || `${user.firstName} ${user.lastName}`,
        email: user.email
      });
    } catch (error) {
      console.log('   ❌ Error parsing user data:', error);
    }
  }
  
  console.log('\n2. Authentication check behavior:');
  console.log('   The app should now prevent multiple simultaneous auth checks');
  console.log('   Look for "⏳ Authentication check already in progress" messages');
  
  console.log('\n✅ Authentication flow test completed!');
};

// Export functions for browser console use
if (typeof window !== 'undefined') {
  window.testRateLimiting = testRateLimiting;
  window.testAuthenticationFlow = testAuthenticationFlow;
  
  console.log('🧪 Rate Limiting Tests Loaded!');
  console.log('Run testRateLimiting() to test API caching');
  console.log('Run testAuthenticationFlow() to test auth flow');
}