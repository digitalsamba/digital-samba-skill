/**
 * Digital Samba Video Call Component
 *
 * A ready-to-use React component for embedding Digital Samba video calls.
 *
 * Usage:
 *   <VideoCall
 *     roomUrl="https://team.digitalsamba.com/room?token=xxx"
 *     onUserJoined={(user) => console.log(`${user.name} joined`)}
 *   />
 */

import React, { useRef } from 'react';
import { useDigitalSamba } from './useDigitalSamba';

interface VideoCallProps {
  /** Full room URL with token */
  roomUrl: string;
  /** Container height (default: 600px) */
  height?: string | number;
  /** Container width (default: 100%) */
  width?: string | number;
  /** Show control buttons (default: true) */
  showControls?: boolean;
  /** Event callbacks */
  onUserJoined?: (user: { id: string; name: string; role: string }) => void;
  onUserLeft?: (user: { id: string; name: string }) => void;
  onSessionEnded?: () => void;
  onError?: (error: { code: string; message: string }) => void;
}

export function VideoCall({
  roomUrl,
  height = 600,
  width = '100%',
  showControls = true,
  onUserJoined,
  onUserLeft,
  onSessionEnded,
  onError
}: VideoCallProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    isLoaded,
    isJoined,
    error,
    localUser,
    participants,
    controls
  } = useDigitalSamba({
    roomUrl,
    containerRef,
    onUserJoined,
    onUserLeft,
    onSessionEnded,
    onError
  });

  return (
    <div style={{ width, fontFamily: 'system-ui, sans-serif' }}>
      {/* Video container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: typeof height === 'number' ? `${height}px` : height,
          backgroundColor: '#1a1a1a',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />

      {/* Status bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: '#f5f5f5',
        borderRadius: '0 0 8px 8px',
        fontSize: '14px'
      }}>
        <div>
          {!isLoaded && <span>Loading...</span>}
          {isLoaded && !isJoined && <span>Ready to join</span>}
          {isJoined && localUser && (
            <span>
              Joined as <strong>{localUser.name}</strong> ({localUser.role})
              {' '}&middot;{' '}
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {error && (
          <span style={{ color: '#dc2626' }}>Error: {error}</span>
        )}
      </div>

      {/* Control buttons */}
      {showControls && isJoined && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '12px',
          flexWrap: 'wrap'
        }}>
          <ControlButton onClick={() => controls.toggleAudio()}>
            Toggle Mic
          </ControlButton>
          <ControlButton onClick={() => controls.toggleVideo()}>
            Toggle Camera
          </ControlButton>
          <ControlButton onClick={() => controls.startScreenshare()}>
            Share Screen
          </ControlButton>
          <ControlButton onClick={() => controls.raiseHand()}>
            Raise Hand
          </ControlButton>
          <ControlButton
            onClick={() => controls.leave()}
            variant="danger"
          >
            Leave
          </ControlButton>
        </div>
      )}
    </div>
  );
}

// Helper component for control buttons
function ControlButton({
  children,
  onClick,
  variant = 'default'
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}) {
  const baseStyles: React.CSSProperties = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'background-color 0.2s'
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: '#e5e7eb',
      color: '#374151'
    },
    danger: {
      backgroundColor: '#dc2626',
      color: 'white'
    }
  };

  return (
    <button
      onClick={onClick}
      style={{ ...baseStyles, ...variantStyles[variant] }}
    >
      {children}
    </button>
  );
}

export default VideoCall;
