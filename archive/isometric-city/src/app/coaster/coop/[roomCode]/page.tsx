'use client';

import React, { useState, useRef } from 'react';
import { CoasterProvider } from '@/context/CoasterContext';
import { MultiplayerContextProvider } from '@/context/MultiplayerContext';
import CoasterGame from '@/components/coaster/Game';
import { CoasterCoopModal } from '@/components/coaster/multiplayer/CoasterCoopModal';
import { GameState as CoasterGameState } from '@/games/coaster/types';
import {
  COASTER_AUTOSAVE_KEY,
  saveCoasterStateToStorage,
  saveParkToIndex,
} from '@/games/coaster/saveUtils';
import { useParams, useRouter } from 'next/navigation';

export default function CoasterCoopPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params.roomCode as string)?.toUpperCase();

  const [showGame, setShowGame] = useState(false);
  const [showCoopModal, setShowCoopModal] = useState(true);
  const [startFresh, setStartFresh] = useState(false);
  const isStartingGameRef = useRef(false);

  const handleExitGame = () => {
    router.push('/coaster');
  };

  const handleCoopStart = (_isHost: boolean, initialState?: CoasterGameState, code?: string) => {
    isStartingGameRef.current = true;

    if (initialState) {
      try {
        saveCoasterStateToStorage(COASTER_AUTOSAVE_KEY, initialState);
        if (code) {
          saveParkToIndex(initialState, code);
        }
      } catch (e) {
        console.error('Failed to save co-op park state:', e);
      }
      setStartFresh(false);
    } else {
      setStartFresh(true);
    }

    setShowGame(true);
    setShowCoopModal(false);
  };

  const handleModalClose = (open: boolean) => {
    if (!open && !showGame && !isStartingGameRef.current) {
      router.push('/coaster');
    }
    setShowCoopModal(open);
  };

  return (
    <MultiplayerContextProvider>
      {showGame ? (
        <CoasterProvider startFresh={startFresh}>
          <main className="h-screen w-screen overflow-hidden">
            <CoasterGame onExit={handleExitGame} />
          </main>
        </CoasterProvider>
      ) : (
        <main className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-950 to-emerald-950 flex items-center justify-center">
          <CoasterCoopModal
            open={showCoopModal}
            onOpenChange={handleModalClose}
            onStartGame={handleCoopStart}
            pendingRoomCode={roomCode}
          />
        </main>
      )}
    </MultiplayerContextProvider>
  );
}
