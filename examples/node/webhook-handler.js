/**
 * Digital Samba - Webhook Handler (Node.js)
 *
 * Demonstrates:
 * - Setting up a webhook endpoint
 * - Authenticating incoming webhooks
 * - Handling different event types
 *
 * Uses only Node.js built-in modules — no dependencies to install.
 *
 * Usage:
 *   DS_WEBHOOK_TOKEN=your-token node webhook-handler.js
 */

const http = require('http');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;

// The bearer token you set as `authorization_header` when creating the webhook.
// Digital Samba sends it verbatim in the Authorization header of every delivery.
const WEBHOOK_TOKEN = process.env.DS_WEBHOOK_TOKEN || 'your-webhook-token';

// Constant-time comparison. timingSafeEqual throws when lengths differ,
// so compare lengths first and keep the comparison itself constant-time.
function verifyAuthorization(headerValue) {
  if (typeof headerValue !== 'string') return false;

  const received = Buffer.from(headerValue);
  const expected = Buffer.from(WEBHOOK_TOKEN);

  if (received.length !== expected.length) return false;
  return crypto.timingSafeEqual(received, expected);
}

// Event handlers.
//
// `participant_joined` and `participant_left` are the two event names confirmed
// by the API docs. Event names are snake_case. For the authoritative list of
// events available to your team, call:
//   GET https://api.digitalsamba.com/api/v1/events
// Any event you subscribe to but do not handle here falls through to the
// default branch below, which logs the name and payload.
const eventHandlers = {
  participant_joined: (data) => {
    console.log(`${data.name} joined room ${data.room_id}`);
    console.log(`Participant ID: ${data.participant_id}`);
    if (data.external_id) {
      // Maps to your own user ID — the JWT 'ud' claim
      console.log(`External ID: ${data.external_id}`);
    }
  },

  participant_left: (data) => {
    console.log(`${data.name} left room ${data.room_id}`);
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
      // Authenticate the delivery before trusting anything in the body
      if (!verifyAuthorization(req.headers['authorization'])) {
        console.error('Rejected webhook: Authorization header did not match');
        res.writeHead(401);
        res.end('Unauthorized');
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
  console.log('\nList the event names available to your team:');
  console.log(`
curl https://api.digitalsamba.com/api/v1/events \\
  -H "Authorization: Bearer YOUR_DEVELOPER_KEY"
`);
  console.log('To register this webhook with Digital Samba:');
  console.log(`
curl -X POST https://api.digitalsamba.com/api/v1/webhooks \\
  -H "Authorization: Bearer YOUR_DEVELOPER_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint": "https://your-domain.com/webhook",
    "name": "My webhook",
    "events": ["participant_joined", "participant_left"],
    "authorization_header": "${WEBHOOK_TOKEN}"
  }'
`);
});
