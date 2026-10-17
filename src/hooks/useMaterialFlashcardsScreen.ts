import { useCallback, useEffect, useRef, useState } from 'react';
import { useMaterialFlashcards } from './useMaterialFlashcards';
import { useNetwork } from './useNetwork';
import { useOnlineGuard } from './useOnlineGuard';

interface UseMaterialFlashcardsScreenParams {
  materialId: string;
}

const DEFAULT_CARD_COUNT = 8;

export const useMaterialFlashcardsScreen = ({
  materialId,
}: UseMaterialFlashcardsScreenParams) => {
  const {
    identity,
    deck,
    loading,
    generating,
    error,
    loadCached,
    loadSaved,
    generate,
    clearError,
  } = useMaterialFlashcards(materialId);
  const { isOnline, initialized: networkInitialized } = useNetwork();
  const { runOnlineAction } = useOnlineGuard();
  const [initialization, setInitialization] = useState({
    identity,
    pending: Boolean(identity),
    error: null as string | null,
  });
  const [position, setPosition] = useState({
    identity,
    deckKey: '',
    index: 0,
    answerVisible: false,
  });
  const mounted = useRef(true);
  const startedIdentity = useRef<string | null>(null);
  const run = useRef({ identity, version: 0, pending: false });

  if (run.current.identity !== identity) {
    run.current = {
      identity,
      version: run.current.version + 1,
      pending: false,
    };
    startedIdentity.current = null;
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      run.current.version += 1;
      run.current.pending = false;
      startedIdentity.current = null;
    };
  }, []);

  // A saved GET often returns the same deck just loaded from cache. Only a
  // different set of cards should reset the current position and face.
  const deckKey = deck
    ? JSON.stringify([
        deck.flashcardSetId,
        deck.cards.map(card => [card.id, card.front, card.back]),
      ])
    : '';
  useEffect(() => {
    setPosition(current =>
      current.identity === identity && current.deckKey === deckKey
        ? current
        : { identity, deckKey, index: 0, answerVisible: false },
    );
  }, [deckKey, identity]);
  const totalCards = deck?.cards.length ?? 0;
  const samePosition =
    position.identity === identity && position.deckKey === deckKey;
  const currentIndex = samePosition
    ? Math.min(position.index, Math.max(0, totalCards - 1))
    : 0;
  const answerVisible = samePosition && position.answerVisible;
  const currentCard = deck?.cards[currentIndex] ?? null;
  const currentInitialization =
    initialization.identity === identity
      ? initialization
      : { identity, pending: Boolean(identity), error: null };

  const initialize = useCallback(async () => {
    if (
      !mounted.current ||
      !networkInitialized ||
      !identity ||
      run.current.identity !== identity ||
      run.current.pending
    ) {
      return;
    }
    const version = ++run.current.version;
    run.current.pending = true;
    const isCurrent = () =>
      mounted.current &&
      run.current.identity === identity &&
      run.current.version === version;
    setInitialization({ identity, pending: true, error: null });
    clearError();
    try {
      const cached = await loadCached();
      if (!isCurrent()) {
        return;
      }
      if (!isOnline) {
        if (!cached) {
          setInitialization({
            identity,
            pending: true,
            error:
              'No cached flashcards are available offline. ' +
              'Connect to the internet and open this deck ' +
              'once to save an offline copy.',
          });
        }
        return;
      }
      const saved = await loadSaved();
      if (isCurrent() && !saved) {
        await generate(DEFAULT_CARD_COUNT);
      }
    } catch {
      // Keep cached cards usable; API errors never trigger a replacement AI call.
    } finally {
      if (isCurrent()) {
        run.current.pending = false;
        setInitialization(current => ({ ...current, pending: false }));
      }
    }
  }, [
    clearError,
    generate,
    identity,
    isOnline,
    loadCached,
    loadSaved,
    networkInitialized,
  ]);

  useEffect(() => {
    if (
      !networkInitialized ||
      !identity ||
      startedIdentity.current === identity
    ) {
      return;
    }
    startedIdentity.current = identity;
    initialize();
  }, [identity, initialize, networkInitialized]);

  const updatePosition = useCallback(
    (
      change: (current: { index: number; answerVisible: boolean }) => {
        index: number;
        answerVisible: boolean;
      },
    ) => {
      setPosition(current => ({
        identity,
        deckKey,
        ...change(
          current.identity === identity && current.deckKey === deckKey
            ? current
            : { index: 0, answerVisible: false },
        ),
      }));
    },
    [deckKey, identity],
  );

  const toggleAnswer = useCallback(() => {
    if (currentCard) {
      updatePosition(current => ({
        ...current,
        answerVisible: !current.answerVisible,
      }));
    }
  }, [currentCard, updatePosition]);
  const previous = useCallback(() => {
    updatePosition(current => ({
      index: Math.max(0, current.index - 1),
      answerVisible: false,
    }));
  }, [updatePosition]);
  const next = useCallback(() => {
    if (totalCards > 0) {
      updatePosition(current => ({
        index: Math.min(current.index + 1, totalCards - 1),
        answerVisible: false,
      }));
    }
  }, [totalCards, updatePosition]);

  const generateAgain = useCallback(() => {
    if (!identity || run.current.pending || loading || generating) {
      return;
    }
    runOnlineAction('AI Flashcards', async () => {
      if (run.current.pending || run.current.identity !== identity) {
        return;
      }
      const version = ++run.current.version;
      run.current.pending = true;
      clearError();
      setInitialization({ identity, pending: false, error: null });
      try {
        const generated = await generate(DEFAULT_CARD_COUNT);
        if (
          mounted.current &&
          run.current.identity === identity &&
          run.current.version === version
        ) {
          setPosition({
            identity,
            deckKey: JSON.stringify([
              generated.flashcardSetId,
              generated.cards.map(card => [card.id, card.front, card.back]),
            ]),
            index: 0,
            answerVisible: false,
          });
        }
      } catch {
        // The data hook presents generation errors without discarding cache.
      } finally {
        if (
          mounted.current &&
          run.current.identity === identity &&
          run.current.version === version
        ) {
          run.current.pending = false;
        }
      }
    });
  }, [clearError, generate, generating, identity, loading, runOnlineAction]);

  return {
    deck,
    currentCard,
    currentIndex,
    displayPosition: totalCards > 0 ? currentIndex + 1 : 0,
    totalCards,
    answerVisible,
    initializing: currentInitialization.pending,
    loading,
    generating,
    busy: currentInitialization.pending || loading || generating,
    error: currentInitialization.error ?? error,
    canGoPrevious: currentIndex > 0,
    canGoNext: currentIndex < totalCards - 1,
    toggleAnswer,
    previous,
    next,
    generateAgain,
    retry: initialize,
  };
};
