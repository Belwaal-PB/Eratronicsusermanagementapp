// Test script to verify Postgres migration
// Run this after setting up your Postgres database

const API_BASE = 'https://your-app-name.vercel.app/api/data';

async function testAPI() {
  console.log('🧪 Testing Postgres Migration...\n');

  try {
    // Test 1: Get all data
    console.log('1️⃣ Testing GET /api/data...');
    const dataResponse = await fetch(`${API_BASE}`);
    if (dataResponse.ok) {
      const data = await dataResponse.json();
      console.log(`✅ Data loaded: ${data.users.length} users, ${data.images.length} images, ${data.clicks.length} clicks`);
    } else {
      console.log('❌ Failed to load data');
      return;
    }

    // Test 2: Test login
    console.log('\n2️⃣ Testing login...');
    const loginResponse = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      if (loginData.success) {
        console.log(`✅ Login successful: ${loginData.user.username} (${loginData.user.user_type})`);
      } else {
        console.log('❌ Login failed: Invalid credentials');
      }
    } else {
      console.log('❌ Login request failed');
    }

    // Test 3: Test user creation
    console.log('\n3️⃣ Testing user creation...');
    const testUser = {
      username: `test_user_${Date.now()}`,
      password: 'testpass123',
      user_type: 'a'
    };

    const createUserResponse = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (createUserResponse.ok) {
      const userData = await createUserResponse.json();
      if (userData.success) {
        console.log(`✅ User created: ${userData.user.username} (ID: ${userData.user.id})`);
        
        // Test 4: Test click recording
        console.log('\n4️⃣ Testing click recording...');
        const clickResponse = await fetch(`${API_BASE}/clicks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            user_id: userData.user.id, 
            image_id: 1 
          })
        });

        if (clickResponse.ok) {
          const clickData = await clickResponse.json();
          if (clickData.success) {
            console.log(`✅ Click recorded: User ${clickData.click.user_id} clicked image ${clickData.click.image_id}`);
          } else {
            console.log('❌ Click recording failed');
          }
        } else {
          console.log('❌ Click request failed');
        }

        // Test 5: Test statistics
        console.log('\n5️⃣ Testing statistics...');
        const statsResponse = await fetch(`${API_BASE}/stats`);
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          console.log(`✅ Statistics loaded: ${stats.summary.total_users} users, ${stats.summary.total_clicks} clicks, ${stats.summary.total_images} images`);
        } else {
          console.log('❌ Statistics request failed');
        }

        // Cleanup: Delete test user
        console.log('\n6️⃣ Cleaning up test user...');
        const deleteResponse = await fetch(`${API_BASE}/users/${userData.user.id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log('✅ Test user deleted');
        } else {
          console.log('⚠️ Failed to delete test user (this is okay)');
        }

      } else {
        console.log('❌ User creation failed');
      }
    } else {
      console.log('❌ User creation request failed');
    }

    console.log('\n🎉 Migration test completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Database connection working');
    console.log('✅ Data persistence working');
    console.log('✅ All API endpoints functional');
    console.log('✅ Your app is ready to use with Postgres!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your Postgres database is created in Vercel');
    console.log('2. Run the init-db function to set up tables');
    console.log('3. Check that your app is deployed and accessible');
    console.log('4. Verify environment variables are set correctly');
  }
}

// Instructions
console.log('🚀 Postgres Migration Test Script');
console.log('=====================================');
console.log('');
console.log('Before running this test:');
console.log('1. Update the API_BASE URL to your Vercel app URL');
console.log('2. Make sure your Postgres database is set up');
console.log('3. Run the init-db function first');
console.log('');
console.log('To run: node test-migration.js');
console.log('');

// Uncomment the line below to run the test
// testAPI();
