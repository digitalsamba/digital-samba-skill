/**
 * Digital Samba - Webhook Handler (Node.js/Express)
 *
 * Demonstrates:
 * - Setting up webhook endpoints
 * - Verifying webhook signatures
 * - Handling different event types
 *
 * Usage:
 *   npm install express
 *   WEBHOOK_SECRET=your-secret node webhook-handler.js
 */

const http = require('http');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';

// Verify webhook signature
function verifySignature(payload, signature) {
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Event handlers
const eventHandlers = {
  'session.started': (data) => {
    console.log(`Meeting started in room ${data.room_id}`);
    console.log(`Session ID: ${data.session_id}`);
  },

  'session.ended': (data) => {
    console.log(`Meeting ended in room ${data.room_id}`);
    console.log(`Duration: ${data.duration} seconds`);
  },

  'participant.joined': (data) => {
    console.log(`${data.name} joined room ${data.room_id}`);
    console.log(`Participant ID: ${data.participant_id}`);
    if (data.external_id) {
      console.log(`External ID: ${data.external_id}`);
    }
  },

  'participant.left': (data) => {
    console.log(`${data.name} left room ${data.room_id}`);
  },

  'recording.started': (data) => {
    console.log(`Recording started in room ${data.room_id}`);
  },

  'recording.stopped': (data) => {
    console.log(`Recording stopped in room ${data.room_id}`);
  },

  'recording.ready': (data) => {
    console.log(`Recording ready: ${data.recording_id}`);
    console.log(`Download URL available via API`);
    // Fetch download URL: GET /api/v1/recordings/{recording_id}/download
  },

  'transcript.ready': (data) => {
    console.log(`Transcript ready for session ${data.session_id}`);
  }
};

// Create HTTP server
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      // Verify signature
      const signature = req.headers['x-signature'];
      if (signature && !verifySignature(body, signature)) {
        console.error('Invalid webhook signature');
        res.writeHead(401);
        res.end('Invalid signature');
        return;
      }

      try {
        const event = JSON.parse(body);
        console.log(`\nReceived event: ${event.event}`);
        console.log(`Timestamp: ${event.timestamp}`);

        // Handle the event
        const handler = eventHandlers[event.event];
        if (handler) {
          handler(event.data);
        } else {
          console.log(`Unhandled event type: ${event.event}`);
          console.log('Data:', JSON.stringify(event.data, null, 2));
        }

        res.writeHead(200);
        res.end('OK');

      } catch (error) {
        console.error('Error parsing webhook:', error.message);
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });

  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200);
    res.end('OK');

  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Webhook handler listening on port ${PORT}`);
  console.log(`Webhook endpoint: POST http://localhost:${PORT}/webhook`);
  console.log(`Health check: GET http://localhost:${PORT}/health`);
  console.log('\nTo register this webhook with Digital Samba:');
  console.log(`
curl -X POST https://api.digitalsamba.com/api/v1/webhooks \\
  -H "Authorization: Bearer YOUR_DEVELOPER_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint": "https://your-domain.com/webhook",
    "events": [
      "session.started",
      "session.ended",
      "participant.joined",
      "participant.left",
      "recording.started",
      "recording.stopped",
      "recording.ready"
    ],
    "secret": "${WEBHOOK_SECRET}"
  }'
`);
});
