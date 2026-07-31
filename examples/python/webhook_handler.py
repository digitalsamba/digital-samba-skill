#!/usr/bin/env python3
"""
Digital Samba - Webhook Handler (Python/FastAPI)

Demonstrates:
- Setting up a webhook endpoint
- Authenticating incoming webhooks
- Handling different event types

Usage:
    pip install fastapi uvicorn
    DS_WEBHOOK_TOKEN=your-token uvicorn webhook_handler:app --reload
"""

import os
import hmac
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, Request, HTTPException, Header

app = FastAPI(title='Digital Samba Webhook Handler')

# The bearer token you set as `authorization_header` when creating the webhook.
# Digital Samba sends it verbatim in the Authorization header of every delivery.
WEBHOOK_TOKEN = os.environ.get('DS_WEBHOOK_TOKEN', 'your-webhook-token')


def verify_authorization(header_value: Optional[str]) -> bool:
    """Constant-time check of the Authorization header against our token."""
    if not header_value:
        return False
    return hmac.compare_digest(header_value, WEBHOOK_TOKEN)


# Event handlers.
#
# Event names are snake_case. See api-reference.md "Webhook Events" for the
# full list (session/room lifecycle, participants, recordings, Q&A, content
# library), or call GET https://api.digitalsamba.com/api/v1/events for the
# current list for your team. Any event you subscribe to but do not handle
# here falls through to the default branch in the endpoint below, which logs
# the name and payload.
def handle_session_started(data: dict):
    print(f'Session started in room {data.get("room_id")}')


def handle_session_ended(data: dict):
    print(f'Session ended in room {data.get("room_id")}')


def handle_participant_joined(data: dict):
    print(f'{data.get("name")} joined room {data.get("room_id")}')
    print(f'Participant ID: {data.get("participant_id")}')
    if data.get('external_id'):
        # Maps to your own user ID — the JWT 'ud' claim
        print(f'External ID: {data.get("external_id")}')


def handle_participant_left(data: dict):
    print(f'{data.get("name")} left room {data.get("room_id")}')


def handle_recording_ready(data: dict):
    print(f'Recording ready in room {data.get("room_id")} — '
          'fetch the download link via GET /api/v1/recordings/{id}/download')


def handle_session_transcript_ready(data: dict):
    print(f'Transcript ready for session {data.get("session_id")}')


EVENT_HANDLERS = {
    'session_started': handle_session_started,
    'session_ended': handle_session_ended,
    'participant_joined': handle_participant_joined,
    'participant_left': handle_participant_left,
    'recording_ready': handle_recording_ready,
    'session_transcript_ready': handle_session_transcript_ready,
}


@app.post('/webhook')
async def webhook(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Handle incoming webhooks from Digital Samba."""
    # Authenticate the delivery before trusting anything in the body
    if not verify_authorization(authorization):
        raise HTTPException(status_code=401, detail='Unauthorized')

    try:
        event = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid JSON')

    event_type = event.get('event')
    timestamp = event.get('timestamp')
    data = event.get('data', {})

    print(f'\n[{datetime.now().isoformat()}] Received event: {event_type}')
    print(f'Timestamp: {timestamp}')

    # Handle the event
    handler = EVENT_HANDLERS.get(event_type)
    if handler:
        handler(data)
    else:
        print(f'Unhandled event type: {event_type}')
        print(f'Data: {data}')

    return {'status': 'ok'}


@app.get('/health')
async def health():
    """Health check endpoint."""
    return {'status': 'healthy'}


@app.get('/')
async def root():
    """Show setup instructions."""
    return {
        'message': 'Digital Samba Webhook Handler',
        'webhook_endpoint': '/webhook',
        'health_endpoint': '/health',
        'setup': '''
List the event names available to your team:

curl https://api.digitalsamba.com/api/v1/events \\
  -H "Authorization: Bearer YOUR_DEVELOPER_KEY"

To register this webhook with Digital Samba:

curl -X POST https://api.digitalsamba.com/api/v1/webhooks \\
  -H "Authorization: Bearer YOUR_DEVELOPER_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint": "https://your-domain.com/webhook",
    "name": "My webhook",
    "events": ["participant_joined", "participant_left"],
    "authorization_header": "your-webhook-token"
  }'
'''
    }


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=3000)
