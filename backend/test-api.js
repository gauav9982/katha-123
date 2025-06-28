const http = require('http');

// Function to make an API request
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve(parsedData);
        } catch (e) {
          console.log('Error parsing:', responseData);
          resolve(responseData);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAllGroupsNumbering() {
  try {
    // 1. Get all groups
    const groups = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/groups',
      method: 'GET'
    });
    
    console.log('Available groups:');
    console.log(groups);
    
    // 2. Get all categories
    const allCategories = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/categories',
      method: 'GET'
    });
    
    console.log('\n=== Testing category numbering for all groups ===\n');
    
    // Check each group
    for (const group of groups) {
      try {
        const groupId = group.id;
        const groupNumber = group.group_number;
        const groupName = group.group_name;
        
        // Get next category number for this group
        const nextNumberResult = await makeRequest({
          hostname: 'localhost',
          port: 4000,
          path: `/api/categories-next-number?group_id=${groupId}`,
          method: 'GET'
        });
        
        // Find existing categories for this group
        const groupCategories = allCategories.filter(c => c.group_id === groupId)
          .sort((a, b) => a.category_number - b.category_number);
          
        console.log(`\nGroup ${groupNumber} (${groupName}) - ID: ${groupId}:`);
        
        if (groupCategories.length > 0) {
          console.log(`Existing categories: ${groupCategories.map(c => c.category_number).join(', ')}`);
          
          // Calculate what should be the next number
          const highest = groupCategories[groupCategories.length - 1].category_number;
          const highestStr = highest.toString();
          const groupStr = groupNumber.toString();
          
          let expectedNextNumber;
          
          if (highestStr.endsWith('9') && highestStr.startsWith(groupStr)) {
            // Check if this is X9 format and should go to X10 next
            const suffix = highestStr.substring(groupStr.length);
            if (suffix === '9') {
              expectedNextNumber = parseInt(groupStr + '10');
              console.log(`Group ${groupNumber} transitions from ${highest} to ${expectedNextNumber}`);
            } else {
              expectedNextNumber = highest + 1;
            }
          } else {
            expectedNextNumber = highest + 1;
          }
          
          console.log(`Expected next number: ${expectedNextNumber}`);
        } else {
          console.log('No existing categories');
          const expectedNextNumber = parseInt(groupNumber.toString() + '1');
          console.log(`Expected next number: ${expectedNextNumber}`);
        }
        
        console.log(`API returned next number: ${nextNumberResult.next_number}`);
      } catch (groupError) {
        console.error(`Error processing group ${group.group_number}:`, groupError.message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testAllGroupsNumbering(); 