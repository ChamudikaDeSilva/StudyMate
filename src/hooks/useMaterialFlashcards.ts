import { useCallback, useEffect, useRef, useState } from 'react';
import { MaterialFlashcards } from '../domain/models/MaterialFlashcards';
import {
  generateMaterialFlashcards,
  getSavedMaterialFlashcards,
} from '../data/remote/api/flashcardService';
import {
  getMaterialFlashcardsCache,
  saveMaterialFlashcardsCache,
} from '../data/local/storage/flashcardCache';
import { useAuth } from './useAuth';

interface DeckState {
  identity: string | null;
  deck: MaterialFlashcards | null;
  loading: boolean;
  generating: boolean;
  error: string | null;
}

const emptyState = (identity: string | null): DeckState => ({
  identity,
  deck: null,
  loading: false,
  generating: false,
  error: null,
});

export const useMaterialFlashcards = (materialId: string) => {
  const { user } = useAuth();
  const userId = user ? String(user.id) : null;
  const owner = userId ? JSON.stringify([userId, materialId]) : null;
  const scope = useRef({ owner, revision: 0 });
  if (scope.current.owner !== owner) {
    scope.current = { owner, revision: scope.current.revision + 1 };
  }
  // Returning to a previous material/account is still a fresh screen scope.
  const identity = owner
    ? JSON.stringify([owner, scope.current.revision])
    : null;
  const [state, setState] = useState<DeckState>(() => emptyState(identity));
  const activeIdentity = useRef(identity);
  const requestVersion = useRef(0);
  const mounted = useRef(true);

  // Invalidate old requests before effects run for a changed material/account.
  if (activeIdentity.current !== identity) {
    activeIdentity.current = identity;
    requestVersion.current += 1;
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      requestVersion.current += 1;
    };
  }, []);

  const beginRequest = useCallback(() => {
    const version = ++requestVersion.current;
    return () =>
      mounted.current &&
      activeIdentity.current === identity &&
      requestVersion.current === version;
  }, [identity]);

  const publish = useCallback(
    (update: Partial<DeckState>) => {
      setState(current => ({
        ...(current.identity === identity ? current : emptyState(identity)),
        ...update,
        identity,
      }));
    },
    [identity],
  );

  const cacheDeck = useCallback(
    async (deck: MaterialFlashcards, isCurrent: () => boolean) => {
      if (!userId || !isCurrent()) {
        return;
      }
      try {
        await saveMaterialFlashcardsCache(userId, materialId, deck);
      } catch (cacheError) {
        // API results remain usable if persistence fails.
        console.warn('[FLASHCARDS CACHE] Save failed:', cacheError);
      }
    },
    [materialId, userId],
  );

  const loadCached =
    useCallback(async (): Promise<MaterialFlashcards | null> => {
      const isCurrent = beginRequest();
      if (!userId) {
        return null;
      }
      try {
        const cached = await getMaterialFlashcardsCache(userId, materialId);
        if (isCurrent()) {
          // A cache miss must not retain another material's cards.
          publish({ deck: cached, error: null });
        }
        return cached;
      } catch (cacheError) {
        if (isCurrent()) {
          publish({ deck: null });
          console.warn('[FLASHCARDS CACHE] Load failed:', cacheError);
        }
        return null;
      }
    }, [beginRequest, materialId, publish, userId]);

  const loadSaved =
    useCallback(async (): Promise<MaterialFlashcards | null> => {
      const isCurrent = beginRequest();
      publish({ loading: true, generating: false, error: null });
      try {
        const result = await getSavedMaterialFlashcards(materialId);
        if (result && isCurrent()) {
          publish({ deck: result });
          await cacheDeck(result, isCurrent);
        }
        return result;
      } catch (loadError) {
        if (isCurrent()) {
          publish({
            error:
              loadError instanceof Error
                ? loadError.message
                : 'Unable to load saved flashcards.',
          });
        }
        throw loadError;
      } finally {
        if (isCurrent()) {
          publish({ loading: false });
        }
      }
    }, [beginRequest, cacheDeck, materialId, publish]);

  const generate = useCallback(
    async (count = 8): Promise<MaterialFlashcards> => {
      const isCurrent = beginRequest();
      publish({ loading: false, generating: true, error: null });
      try {
        const result = await generateMaterialFlashcards(materialId, count);
        if (isCurrent()) {
          publish({ deck: result });
          await cacheDeck(result, isCurrent);
        }
        return result;
      } catch (generateError) {
        if (isCurrent()) {
          publish({
            error:
              generateError instanceof Error
                ? generateError.message
                : 'Unable to generate flashcards.',
          });
        }
        throw generateError;
      } finally {
        if (isCurrent()) {
          publish({ generating: false });
        }
      }
    },
    [beginRequest, cacheDeck, materialId, publish],
  );

  const clearError = useCallback(() => publish({ error: null }), [publish]);
  const clear = useCallback(() => {
    requestVersion.current += 1;
    setState(emptyState(identity));
  }, [identity]);
  const current = state.identity === identity ? state : emptyState(identity);

  return {
    identity,
    deck: current.deck,
    loading: current.loading,
    generating: current.generating,
    error: current.error,
    loadCached,
    loadSaved,
    generate,
    clearError,
    clear,
  };
};
