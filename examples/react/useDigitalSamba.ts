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

    sambaFrame.on('userJoined', (event) => {
      setIsJoined(true);
      setLocalUser(event.data);
      onUserJoined?.(event.data);
    });

    sambaFrame.on('userLeft', (event) => {
      onUserLeft?.(event.data);
    });

    sambaFrame.on('usersUpdated', (event) => {
      setParticipants(event.data);
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

    sambaFrame.on('connectionFailure', (event) => {
      setError(event.data.error || 'Connection failed');
      onError?.({ code: 'CONNECTION_FAILURE', message: event.data.error });
    });

    // Auto-load if enabled
    if (autoLoad) {
      sambaFrame.load();
    }

    // Cleanup
    return () => {
      if (sambaRef.current) {
        sambaRef.current.leaveSession();
        sambaRef.current = null;
      }
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
