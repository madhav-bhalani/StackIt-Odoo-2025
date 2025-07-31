// Test script to verify authentication persistence
// This script can be run in the browser console to test auth functionality

const testAuthPersistence = () => {
  console.log('🔐 Testing Authentication Persistence...\n');
  
  // Test 1: Check if token exists in localStorage
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  
  console.log('1. Checking stored authentication data:');
  console.log('   Token exists:', !!token);
  console.log('   User data exists:', !!storedUser);
  
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
  
  // Test 2: Check current authentication state from context
  console.log('\n2. Current authentication state:');
  console.log('   Check the UserContext state in React DevTools');
  
  // Test 3: Test protected route behavior
  console.log('\n3. Testing protected routes:');
  console.log('   Try navigating to /ask - should redirect to login if not authenticated');
  console.log('   Try navigating to /login when authenticated - should redirect to home');
  
  // Test 4: Test token refresh behavior
  console.log('\n4. Token validation:');
  if (token) {
    console.log('   Token exists - app should validate with server on load');
  } else {
    console.log('   No token - user should see login/register options');
  }
  
  console.log('\n✅ Authentication persistence test completed!');
  console.log('💡 To fully test:');
  console.log('   1. Login to the app');
  console.log('   2. Refresh the page');
  console.log('   3. Check if you remain logged in');
  console.log('   4. Try accessing protected routes');
  console.log('   5. Try accessing login/register when authenticated');
};

const testAuthFlow = async () => {
  console.log('🔄 Testing Authentication Flow...\n');
  
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('❌ No token found. Please login first.');
    return;
  }
  
  console.log('✅ Token found, testing server validation...');
  
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server validation successful:', data);
    } else {
      console.log('❌ Server validation failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Network error during validation:', error);
  }
};

const testProtectedRoutes = () => {
  console.log('🛡️ Testing Protected Routes...\n');
  
  const currentPath = window.location.pathname;
  console.log('Current path:', currentPath);
  
  const protectedRoutes = ['/ask'];
  const publicRoutes = ['/login', '/register'];
  const openRoutes = ['/', '/question'];
  
  console.log('Protected routes (require auth):', protectedRoutes);
  console.log('Public routes (redirect if authenticated):', publicRoutes);
  console.log('Open routes (accessible to all):', openRoutes);
  
  const isAuthenticated = !!localStorage.getItem('token');
  console.log('Currently authenticated:', isAuthenticated);
  
  if (protectedRoutes.includes(currentPath)) {
    console.log('✅ On protected route - should redirect to login if not authenticated');
  } else if (publicRoutes.includes(currentPath)) {
    console.log('✅ On public route - should redirect to home if authenticated');
  } else {
    console.log('✅ On open route - accessible to all users');
  }
};

// Export functions for browser console use
if (typeof window !== 'undefined') {
  window.testAuthPersistence = testAuthPersistence;
  window.testProtectedRoutes = testProtectedRoutes;
  
  console.log('🧪 Authentication Tests Loaded!');
  console.log('Run testAuthPersistence() to test auth persistence');
  console.log('Run testProtectedRoutes() to test route protection');
}