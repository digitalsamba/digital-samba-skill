#!/usr/bin/env python3
"""
Digital Samba - Basic Room Management (Python)

Demonstrates:
- Creating a room
- Generating participant tokens
- Listing rooms
- Deleting a room

Usage:
    pip install requests pyjwt
    DS_DEVELOPER_KEY=your-key DS_TEAM_ID=your-team-id python basic_room.py
"""

import os
import time
import requests
import jwt

# Configuration
DEVELOPER_KEY = os.environ.get('DS_DEVELOPER_KEY')
TEAM_ID = os.environ.get('DS_TEAM_ID')
BASE_URL = 'https://api.digitalsamba.com/api/v1'

if not DEVELOPER_KEY:
    print('Error: DS_DEVELOPER_KEY environment variable required')
    exit(1)


def api_call(method: str, endpoint: str, data: dict = None) -> dict:
    """Make an authenticated API call."""
    url = f'{BASE_URL}{endpoint}'
    headers = {
        'Authorization': f'Bearer {DEVELOPER_KEY}',
        'Content-Type': 'application/json'
    }

    response = requests.request(method, url, headers=headers, json=data)

    if response.status_code == 204:
        return None
    elif response.ok:
        return response.json()
    else:
        raise Exception(f'API Error {response.status_code}: {response.text}')


def create_room_token(room_id: str, user_name: str, user_id: str = None, role: str = 'attendee') -> str:
    """Generate a JWT token for room access (alternative to API token endpoint)."""
    if not TEAM_ID:
        raise ValueError('DS_TEAM_ID required for local JWT generation')

    payload = {
        'td': TEAM_ID,
        'rd': room_id,
        'u': user_name,
        'ud': user_id,
        'role': role,
        'exp': int(time.time()) + 3600  # 1 hour
    }

    return jwt.encode(payload, DEVELOPER_KEY, algorithm='HS256')


def main():
    try:
        # 1. Create a room
        print('1. Creating room...')
        room = api_call('POST', '/rooms', {
            'friendly_url': f'demo-room-{int(time.time())}',
            'privacy': 'public',
            'description': 'Demo room created via Python',
            'max_participants': 50,
            'chat_enabled': True,
            'recordings_enabled': True
        })
        print(f'   Room created: {room["room_url"]}')
        print(f'   Room ID: {room["id"]}')

        # 2a. Generate token via API
        print('\n2a. Generating token via API...')
        token_response = api_call('POST', f'/rooms/{room["id"]}/token', {
            'ud': 'user-123',
            'u': 'Demo User',
            'role': 'moderator'
        })
        print(f'   Join link: {token_response["link"]}')

        # 2b. Generate token locally (alternative)
        if TEAM_ID:
            print('\n2b. Generating token locally...')
            local_token = create_room_token(
                room_id=room['id'],
                user_name='Local Token User',
                user_id='user-456',
                role='attendee'
            )
            print(f'   Local token generated (first 50 chars): {local_token[:50]}...')

        # 3. List rooms
        print('\n3. Listing rooms...')
        rooms = api_call('GET', '/rooms?limit=5')
        print(f'   Total rooms: {rooms["total_count"]}')
        for r in rooms['data'][:3]:
            print(f'   - {r["friendly_url"]} ({r["privacy"]})')

        # 4. Get room details
        print(f'\n4. Getting room details...')
        details = api_call('GET', f'/rooms/{room["id"]}')
        print(f'   Max participants: {details["max_participants"]}')
        print(f'   Chat enabled: {details["chat_enabled"]}')
        print(f'   Recordings enabled: {details["recordings_enabled"]}')

        # 5. Delete room
        print('\n5. Deleting room...')
        api_call('DELETE', f'/rooms/{room["id"]}')
        print('   Room deleted')

        print('\nDemo complete!')

    except Exception as e:
        print(f'Error: {e}')
        exit(1)


if __name__ == '__main__':
    main()
