/**
 * Digital Samba - Basic Room Management (Node.js)
 *
 * Demonstrates:
 * - Creating a room
 * - Generating participant tokens
 * - Listing rooms
 * - Deleting a room
 *
 * Usage:
 *   DS_DEVELOPER_KEY=your-key DS_TEAM_ID=your-team-id node basic-room.js
 */

const https = require('https');

const DEVELOPER_KEY = process.env.DS_DEVELOPER_KEY;
const TEAM_ID = process.env.DS_TEAM_ID;

if (!DEVELOPER_KEY) {
  console.error('Error: DS_DEVELOPER_KEY environment variable required');
  process.exit(1);
}

// Helper function for API calls
function apiCall(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.digitalsamba.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${DEVELOPER_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 204) {
          resolve(null);
        } else if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`API Error ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function main() {
  try {
    // 1. Create a room
    console.log('1. Creating room...');
    const room = await apiCall('POST', '/api/v1/rooms', {
      friendly_url: `demo-room-${Date.now()}`,
      privacy: 'public',
      description: 'Demo room created via Node.js',
      max_participants: 50,
      chat_enabled: true,
      recordings_enabled: true
    });
    console.log(`   Room created: ${room.room_url}`);
    console.log(`   Room ID: ${room.id}`);

    // 2. Generate a participant token
    console.log('\n2. Generating participant token...');
    const tokenResponse = await apiCall('POST', `/api/v1/rooms/${room.id}/token`, {
      ud: 'user-123',
      u: 'Demo User',
      role: 'moderator'
    });
    console.log(`   Token generated`);
    console.log(`   Join link: ${tokenResponse.link}`);

    // 3. List all rooms
    console.log('\n3. Listing rooms...');
    const rooms = await apiCall('GET', '/api/v1/rooms?limit=5');
    console.log(`   Total rooms: ${rooms.total_count}`);
    rooms.data.slice(0, 3).forEach(r => {
      console.log(`   - ${r.friendly_url} (${r.privacy})`);
    });

    // 4. Delete the room
    console.log('\n4. Deleting room...');
    await apiCall('DELETE', `/api/v1/rooms/${room.id}`);
    console.log('   Room deleted');

    console.log('\nDemo complete!');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
