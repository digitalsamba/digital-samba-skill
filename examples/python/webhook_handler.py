#!/usr/bin/env python3
"""
Digital Samba - Webhook Handler (Python/FastAPI)

Demonstrates:
- Setting up webhook endpoints
- Verifying webhook signatures
- Handling different event types

Usage:
    pip install fastapi uvicorn
    WEBHOOK_SECRET=your-secret uvicorn webhook_handler:app --reload
"""

import os
import hmac
import hashlib
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, Request, HTTPException, Header

app = FastAPI(title='Digital Samba Webhook Handler')

WEBHOOK_SECRET = os.environ.get('WEBHOOK_SECRET', 'your-webhook-secret')


def verify_signature(payload: bytes, signature: str) -> bool:
    """Verify the webhook signature using HMAC-SHA256."""
    expected = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected)


# Event handlers
def handle_session_started(data: dict):
    print(f'Meeting started in room {data.get("room_id")}')
    print(f'Session ID: {data.get("session_id")}')


def handle_session_ended(data: dict):
    print(f'Meeting ended in room {data.get("room_id")}')
    print(f'Duration: {data.get("duration")} seconds')


def handle_participant_joined(data: dict):
    print(f'{data.get("name")} joined room {data.get("room_id")}')
    print(f'Participant ID: {data.get("participant_id")}')
    if data.get('external_id'):
        print(f'External ID: {data.get("external_id")}')


def handle_participant_left(data: dict):
    print(f'{data.get("name")} left room {data.get("room_id")}')


def handle_recording_started(data: dict):
    print(f'Recording started in room {data.get("room_id")}')


def handle_recording_stopped(data: dict):
    print(f'Recording stopped in room {data.get("room_id")}')


def handle_recording_ready(data: dict):
    print(f'Recording ready: {data.get("recording_id")}')
    print('Download URL available via API')


def handle_transcript_ready(data: dict):
    print(f'Transcript ready for session {data.get("session_id")}')


EVENT_HANDLERS = {
    'session.started': handle_session_started,
    'session.ended': handle_session_ended,
    'participant.joined': handle_participant_joined,
    'participant.left': handle_participant_left,
    'recording.started': handle_recording_started,
    'recording.stopped': handle_recording_stopped,
    'recording.ready': handle_recording_ready,
    'transcript.ready': handle_transcript_ready,
}


@app.post('/webhook')
async def webhook(
    request: Request,
    x_signature: Optional[str] = Header(None)
):
    """Handle incoming webhooks from Digital Samba."""
    body = await request.body()

    # Verify signature if provided
    if x_signature:
        if not verify_signature(body, x_signature):
            raise HTTPException(status_code=401, detail='Invalid signature')

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
To register this webhook with Digital Samba:

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
    "secret": "your-webhook-secret"
  }'
'''
    }


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=3000)
