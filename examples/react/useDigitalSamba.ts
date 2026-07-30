/**
 * Digital Samba React Hook
 *
 * A reusable hook for embedding Digital Samba video calls in React applications.
 *
 * Usage:
 *   const { isLoaded, error, controls } = useDigitalSamba({
 *     roomUrl: 'https://team.digitalsamba.com/room?token=xxx',
 *     containerRef: myRef
 *   });
 */

import { useEffect, useRef, useState, useCallback, RefObject } from 'react';
import DigitalSambaEmbedded from '@digitalsamba/embedded-sdk';

interface UseDigitalSambaOptions {
  /** Full room URL with token */
  roomUrl: string;
  /** Ref to the container element */
  containerRef: RefObject<HTMLElement>;
  /** Auto-load on mount (default: true) */
  autoLoad?: boolean;
  /** Event callbacks */
  onUserJoined?: (user: { id: string; name: string; role: string }) => void;
  onUserLeft?: (user: { id: string; name: string }) => void;
  onRecordingStarted?: () => void;
  onRecordingStopped?: () => void;
  onSessionEnded?: () => void;
  onError?: (error: { code: string; message: string }) => void;
}

interface DigitalSambaControls {
  load: () => void;
  leave: () => void;
  toggleAudio: (enabled?: boolean) => void;
  toggleVideo: (enabled?: boolean) => void;
  startRecording: () => void;
  stopRecording: () => void;
  startScreenshare: () => void;
  stopScreenshare: () => void;
  raiseHand: () => void;
  lowerHand: () => void;
}

interface UseDigitalSambaReturn {
  isLoaded: boolean;
  isJoined: boolean;
  error: string | null;
  controls: DigitalSambaControls;
  localUser: { id: string; name: string; role: string } | null;
  participants: Array<{ id: string; name: string; role: string }>;
}

export function useDigitalSamba({
  roomUrl,
  containerRef,
  autoLoad = true,
  onUserJoined,
  onUserLeft,
  onRecordingStarted,
  onRecordingStopped,
  onSessionEnded,
  onError
}: UseDigitalSambaOptions): UseDigitalSambaReturn {
  const sambaRef = useRef<DigitalSambaEmbedded | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localUser, setLocalUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [participants, setParticipants] = useState<Array<{ id: string; name: string; role: string }>>([]);

  // Initialize SDK
  useEffect(() => {
    if (!containerRef.current || !roomUrl) return;

    const sambaFrame = DigitalSambaEmbedded.createControl({
      url: roomUrl,
      root: containerRef.current
    });

    sambaRef.current = sambaFrame;

    // Set up event listeners
    sambaFrame.on('frameLoaded', () => {
      setIsLoaded(true);
    });

    // userJoined payload is { user, type } — type is 'local' for the current user
    sambaFrame.on('userJoined', (event) => {
      if (event.data.type === 'local') {
        setIsJoined(true);
        setLocalUser(event.data.user);
      }
      onUserJoined?.(event.data.user);
    });

    // userLeft payload is { user }
    sambaFrame.on('userLeft', (event) => {
      onUserLeft?.(event.data.user);
    });

    // usersUpdated payload is { users } — not a bare array
    sambaFrame.on('usersUpdated', (event) => {
      setParticipants(event.data.users);
    });

    sambaFrame.on('recordingStarted', () => {
      onRecordingStarted?.();
    });

    sambaFrame.on('recordingStopped', () => {
      onRecordingStopped?.();
    });

    sambaFrame.on('sessionEnded', () => {
      setIsJoined(false);
      onSessionEnded?.();
    });

    sambaFrame.on('appError', (event) => {
      setError(event.data.message);
      onError?.(event.data);
    });

    sambaFrame.on('mediaConnectionFailed', () => {
      const message = 'Media connection failed — check network and firewall rules';
      setError(message);
      onError?.({ code: 'MEDIA_CONNECTION_FAILED', message });
    });

    sambaFrame.on('mediaPermissionsFailed', () => {
      const message = 'Camera/microphone access was denied by the browser';
      setError(message);
      onError?.({ code: 'MEDIA_PERMISSIONS_FAILED', message });
    });

    // Auto-load if enabled
    if (autoLoad) {
      sambaFrame.load();
    }

    // Cleanup. The SDK has no destroy() — leave the session, then remove the
    // iframe it injected, otherwise a remount stacks iframes in the container.
    return () => {
      sambaFrame.leaveSession();
      sambaFrame.frame?.remove();
      sambaRef.current = null;
      setIsLoaded(false);
      setIsJoined(false);
      setLocalUser(null);
      setParticipants([]);
    };
  }, [roomUrl, containerRef, autoLoad]);

  // Control methods
  const load = useCallback(() => {
    sambaRef.current?.load();
  }, []);

  const leave = useCallback(() => {
    sambaRef.current?.leaveSession();
  }, []);

  const toggleAudio = useCallback((enabled?: boolean) => {
    if (enabled !== undefined) {
      sambaRef.current?.toggleAudio(enabled);
    } else {
      sambaRef.current?.toggleAudio();
    }
  }, []);

  const toggleVideo = useCallback((enabled?: boolean) => {
    if (enabled !== undefined) {
      sambaRef.current?.toggleVideo(enabled);
    } else {
      sambaRef.current?.toggleVideo();
    }
  }, []);

  const startRecording = useCallback(() => {
    sambaRef.current?.startRecording();
  }, []);

  const stopRecording = useCallback(() => {
    sambaRef.current?.stopRecording();
  }, []);

  const startScreenshare = useCallback(() => {
    sambaRef.current?.startScreenshare();
  }, []);

  const stopScreenshare = useCallback(() => {
    sambaRef.current?.stopScreenshare();
  }, []);

  const raiseHand = useCallback(() => {
    sambaRef.current?.raiseHand();
  }, []);

  const lowerHand = useCallback(() => {
    sambaRef.current?.lowerHand();
  }, []);

  return {
    isLoaded,
    isJoined,
    error,
    localUser,
    participants,
    controls: {
      load,
      leave,
      toggleAudio,
      toggleVideo,
      startRecording,
      stopRecording,
      startScreenshare,
      stopScreenshare,
      raiseHand,
      lowerHand
    }
  };
}

export default useDigitalSamba;
