import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { MaterialFlashcards } from '../../src/domain/models/MaterialFlashcards';
import { useAuth } from '../../src/hooks/useAuth';
import { useNetwork } from '../../src/hooks/useNetwork';
import { useMaterialFlashcardsScreen } from '../../src/hooks/useMaterialFlashcardsScreen';
import {
  generateMaterialFlashcards,
  getSavedMaterialFlashcards,
} from '../../src/data/remote/api/flashcardService';
import {
  getMaterialFlashcardsCache,
  saveMaterialFlashcardsCache,
} from '../../src/data/local/storage/flashcardCache';

jest.mock('../../src/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('../../src/hooks/useNetwork', () => ({ useNetwork: jest.fn() }));
jest.mock('../../src/hooks/useOnlineGuard', () => ({
  useOnlineGuard: () => ({
    runOnlineAction: (_label: string, action: () => void) => action(),
  }),
}));
jest.mock('../../src/data/remote/api/flashcardService', () => ({
  generateMaterialFlashcards: jest.fn(),
  getSavedMaterialFlashcards: jest.fn(),
}));
jest.mock('../../src/data/local/storage/flashcardCache', () => ({
  getMaterialFlashcardsCache: jest.fn(),
  saveMaterialFlashcardsCache: jest.fn(),
}));
jest.mock('react-native-css-interop', () => ({
  createInteropElement: require('react').createElement,
}));

const cached = jest.mocked(getMaterialFlashcardsCache);
const saved = jest.mocked(getSavedMaterialFlashcards);
const generated = jest.mocked(generateMaterialFlashcards);
const persisted = jest.mocked(saveMaterialFlashcardsCache);
const mounted: ReactTestRenderer.ReactTestRenderer[] = [];
const makeDeck = (
  materialId = 'material-1',
  prefix = materialId,
): MaterialFlashcards => ({
  materialId,
  flashcardSetId: `${prefix}-set`,
  title: prefix,
  sourceType: 'text',
  provider: 'gemini',
  cardCount: 3,
  cards: Array.from({ length: 3 }, (_, index) => ({
    id: `${prefix}-${index}`,
    position: index + 1,
    front: `${prefix} question ${index + 1}`,
    back: `${prefix} answer ${index + 1}`,
  })),
});
const deck = makeDeck();
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};
const setUser = (id: string | null) => {
  jest.mocked(useAuth).mockReturnValue({
    user: id ? { id } : null,
  } as ReturnType<typeof useAuth>);
};
const setNetwork = (isOnline: boolean, initialized = true) => {
  jest.mocked(useNetwork).mockReturnValue({
    isOnline,
    initialized,
  } as ReturnType<typeof useNetwork>);
};
const mount = async (firstMaterialId = 'material-1') => {
  let materialId = firstMaterialId;
  let current!: ReturnType<typeof useMaterialFlashcardsScreen>;
  const Harness = () => {
    current = useMaterialFlashcardsScreen({ materialId });
    return null;
  };
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = ReactTestRenderer.create(<Harness />);
  });
  mounted.push(renderer);
  return {
    get current() {
      return current;
    },
    rerender: async (nextMaterialId = materialId) => {
      materialId = nextMaterialId;
      await act(async () => renderer.update(<Harness />));
    },
    unmount: async () => {
      mounted.splice(mounted.indexOf(renderer), 1);
      await act(async () => renderer.unmount());
    },
  };
};

beforeEach(() => {
  jest.resetAllMocks();
  setUser('user-1');
  setNetwork(false);
  cached.mockResolvedValue(deck);
  saved.mockResolvedValue(deck);
  persisted.mockResolvedValue(undefined);
  generated.mockResolvedValue(makeDeck('material-1', 'generated'));
});

afterEach(() => {
  act(() => mounted.splice(0).forEach(renderer => renderer.unmount()));
});

test('repeated flips and next/previous keep the correct card and reset its face', async () => {
  const screen = await mount();
  for (let cycle = 0; cycle < 8; cycle += 1) {
    act(() => screen.current.toggleAnswer());
    expect(screen.current.answerVisible).toBe(true);
    expect(screen.current.currentCard?.back).toBe(deck.cards[0].back);
    act(() => screen.current.toggleAnswer());
    expect(screen.current.answerVisible).toBe(false);
    expect(screen.current.currentCard?.front).toBe(deck.cards[0].front);
  }
  for (let cycle = 0; cycle < 4; cycle += 1) {
    act(() => screen.current.next());
    expect(screen.current.currentCard?.id).toBe(deck.cards[1].id);
    act(() => screen.current.toggleAnswer());
    act(() => screen.current.previous());
    expect(screen.current.currentCard?.id).toBe(deck.cards[0].id);
    expect(screen.current.answerVisible).toBe(false);
  }
  act(() => {
    for (let i = 0; i < 10; i += 1) {
      screen.current.next();
    }
  });
  expect(screen.current.currentIndex).toBe(2);
  expect(screen.current.canGoNext).toBe(false);
  act(() => {
    for (let i = 0; i < 10; i += 1) {
      screen.current.previous();
    }
  });
  expect(screen.current.currentIndex).toBe(0);
  expect(screen.current.canGoPrevious).toBe(false);
  expect(generated).not.toHaveBeenCalled();
});

test('the same saved deck arriving late preserves cached study position and answer', async () => {
  setNetwork(true);
  const response = deferred<MaterialFlashcards | null>();
  saved.mockReturnValue(response.promise);
  const screen = await mount();
  expect(screen.current.loading).toBe(true);
  act(() => screen.current.next());
  act(() => screen.current.toggleAnswer());
  await act(async () => response.resolve({ ...deck, cards: [...deck.cards] }));
  expect(screen.current.currentIndex).toBe(1);
  expect(screen.current.answerVisible).toBe(true);
  expect(screen.current.busy).toBe(false);
  expect(saved).toHaveBeenCalledTimes(1);
});

test('a different saved deck resets position and answer to its first card', async () => {
  setNetwork(true);
  const response = deferred<MaterialFlashcards | null>();
  saved.mockReturnValue(response.promise);
  const screen = await mount();
  act(() => screen.current.next());
  act(() => screen.current.toggleAnswer());
  const replacement = makeDeck('material-1', 'replacement');
  await act(async () => response.resolve(replacement));
  expect(screen.current.currentCard?.id).toBe(replacement.cards[0].id);
  expect(screen.current.currentIndex).toBe(0);
  expect(screen.current.answerVisible).toBe(false);
});

test('changing material loads its cache and ignores a late saved response for the old material', async () => {
  setNetwork(true);
  const response = deferred<MaterialFlashcards | null>();
  const secondDeck = makeDeck('material-2');
  cached.mockImplementation(async (_userId, materialId) =>
    materialId === 'material-2' ? secondDeck : deck,
  );
  saved.mockImplementation(materialId =>
    materialId === 'material-2'
      ? Promise.resolve(secondDeck)
      : response.promise,
  );
  const screen = await mount();
  act(() => screen.current.next());
  await screen.rerender('material-2');
  expect(screen.current.deck?.materialId).toBe('material-2');
  expect(screen.current.currentIndex).toBe(0);
  await act(async () => response.resolve(makeDeck('material-1', 'obsolete')));
  expect(screen.current.deck).toEqual(secondDeck);
  expect(persisted).toHaveBeenCalledTimes(1);
  expect(persisted).toHaveBeenCalledWith('user-1', 'material-2', secondDeck);
});

test('an old request error cannot replace the new material state or trigger generation', async () => {
  setNetwork(true);
  const response = deferred<MaterialFlashcards | null>();
  const secondDeck = makeDeck('material-2');
  cached.mockImplementation(async (_userId, materialId) =>
    materialId === 'material-2' ? secondDeck : deck,
  );
  saved.mockImplementation(materialId =>
    materialId === 'material-2'
      ? Promise.resolve(secondDeck)
      : response.promise,
  );
  const screen = await mount();
  await screen.rerender('material-2');
  await act(async () => response.reject(new Error('Obsolete request failed')));
  expect(screen.current.error).toBeNull();
  expect(screen.current.deck).toEqual(secondDeck);
  expect(screen.current.busy).toBe(false);
  expect(generated).not.toHaveBeenCalled();
});

test('an offline cache miss for a new material clears the old deck', async () => {
  cached.mockImplementation(async (_userId, materialId) =>
    materialId === 'material-1' ? deck : null,
  );
  const screen = await mount();
  await screen.rerender('material-2');
  expect(screen.current.deck).toBeNull();
  expect(screen.current.currentCard).toBeNull();
  expect(screen.current.error).toContain('No cached flashcards');
  expect(screen.current.busy).toBe(false);
  expect(saved).not.toHaveBeenCalled();
});

test('account changes ignore late cache reads and use only the new account cache', async () => {
  const response = deferred<MaterialFlashcards | null>();
  const secondDeck = makeDeck('material-1', 'second-account');
  cached.mockImplementation(userId =>
    userId === 'user-1' ? response.promise : Promise.resolve(secondDeck),
  );
  const screen = await mount();
  setUser('user-2');
  await screen.rerender();
  expect(screen.current.deck).toEqual(secondDeck);
  await act(async () => response.resolve(deck));
  expect(screen.current.deck).toEqual(secondDeck);
  expect(cached).toHaveBeenCalledWith('user-2', 'material-1');
});

test('signing out and returning to the same account reloads that account cache', async () => {
  const screen = await mount();
  setUser(null);
  await screen.rerender();
  expect(screen.current.deck).toBeNull();
  expect(screen.current.initializing).toBe(false);
  setUser('user-1');
  await screen.rerender();
  expect(screen.current.deck).toEqual(deck);
  expect(cached).toHaveBeenCalledTimes(2);
});

test('unmounting while cache loads prevents subsequent saved or generated requests', async () => {
  setNetwork(true);
  const response = deferred<MaterialFlashcards | null>();
  cached.mockReturnValue(response.promise);
  const screen = await mount();
  await screen.unmount();
  await act(async () => response.resolve(null));
  expect(saved).not.toHaveBeenCalled();
  expect(generated).not.toHaveBeenCalled();
});

test('unmounting ignores a late API result without publishing it to cache', async () => {
  setNetwork(true);
  const response = deferred<MaterialFlashcards | null>();
  saved.mockReturnValue(response.promise);
  const screen = await mount();
  await screen.unmount();
  await act(async () => response.resolve(deck));
  expect(persisted).not.toHaveBeenCalled();
});

test('repeated retries while loading share one request', async () => {
  setNetwork(true);
  const response = deferred<MaterialFlashcards | null>();
  saved.mockReturnValue(response.promise);
  const screen = await mount();
  await act(async () => {
    await screen.current.retry();
    await screen.current.retry();
  });
  expect(saved).toHaveBeenCalledTimes(1);
  expect(generated).not.toHaveBeenCalled();
  await act(async () => response.resolve(deck));
});

test('repeated refresh presses generate once and reset the successful new deck', async () => {
  setNetwork(true);
  const screen = await mount();
  act(() => screen.current.next());
  act(() => screen.current.toggleAnswer());
  const response = deferred<MaterialFlashcards>();
  generated.mockReturnValue(response.promise);
  act(() => {
    screen.current.generateAgain();
    screen.current.generateAgain();
  });
  expect(generated).toHaveBeenCalledTimes(1);
  await act(async () => response.resolve(makeDeck('material-1', 'new-deck')));
  expect(screen.current.currentIndex).toBe(0);
  expect(screen.current.answerVisible).toBe(false);
  expect(screen.current.currentCard?.front).toBe('new-deck question 1');
});

test('a failed saved request keeps cached cards and never automatically regenerates', async () => {
  setNetwork(true);
  saved.mockRejectedValue(new Error('Service unavailable'));
  const screen = await mount();
  expect(screen.current.deck).toEqual(deck);
  expect(screen.current.error).toBe('Service unavailable');
  expect(screen.current.busy).toBe(false);
  expect(generated).not.toHaveBeenCalled();
});

test('network changes do not automatically refetch or regenerate an initialized deck', async () => {
  const screen = await mount();
  act(() => screen.current.next());
  setNetwork(true);
  await screen.rerender();
  expect(screen.current.currentIndex).toBe(1);
  expect(cached).toHaveBeenCalledTimes(1);
  expect(saved).not.toHaveBeenCalled();
  expect(generated).not.toHaveBeenCalled();
});

test('an empty offline deck keeps navigation within zero cards', async () => {
  cached.mockResolvedValue({ ...deck, cardCount: 0, cards: [] });
  const screen = await mount();
  act(() => {
    screen.current.next();
    screen.current.previous();
    screen.current.toggleAnswer();
  });
  expect(screen.current.currentIndex).toBe(0);
  expect(screen.current.displayPosition).toBe(0);
  expect(screen.current.currentCard).toBeNull();
  expect(screen.current.answerVisible).toBe(false);
});

test('returning to a previous material starts at its question without reusing an old request', async () => {
  const secondDeck = makeDeck('material-2');
  cached.mockImplementation(async (_userId, materialId) =>
    materialId === 'material-2' ? secondDeck : deck,
  );
  const screen = await mount();
  act(() => screen.current.next());
  act(() => screen.current.toggleAnswer());
  const oldRetry = screen.current.retry;
  await screen.rerender('material-2');
  await act(async () => oldRetry());
  expect(cached).toHaveBeenCalledTimes(2);
  await screen.rerender('material-1');
  expect(screen.current.currentIndex).toBe(0);
  expect(screen.current.answerVisible).toBe(false);
  expect(cached).toHaveBeenCalledTimes(3);
});

test('an obsolete missing-saved response cannot generate cards for the old material', async () => {
  setNetwork(true);
  const response = deferred<MaterialFlashcards | null>();
  const secondDeck = makeDeck('material-2');
  cached.mockImplementation(async (_userId, materialId) =>
    materialId === 'material-2' ? secondDeck : deck,
  );
  saved.mockImplementation(materialId =>
    materialId === 'material-2'
      ? Promise.resolve(secondDeck)
      : response.promise,
  );
  const screen = await mount();
  await screen.rerender('material-2');
  await act(async () => response.resolve(null));
  expect(generated).not.toHaveBeenCalled();
  expect(screen.current.deck).toEqual(secondDeck);
});

test('a late generated deck cannot replace a new material or its study position', async () => {
  setNetwork(true);
  const secondDeck = makeDeck('material-2');
  cached.mockImplementation(async (_userId, materialId) =>
    materialId === 'material-2' ? secondDeck : deck,
  );
  saved.mockImplementation(async materialId =>
    materialId === 'material-2' ? secondDeck : deck,
  );
  const screen = await mount();
  const response = deferred<MaterialFlashcards>();
  generated.mockReturnValue(response.promise);
  act(() => screen.current.generateAgain());
  await screen.rerender('material-2');
  act(() => screen.current.next());
  await act(async () =>
    response.resolve(makeDeck('material-1', 'obsolete-generation')),
  );
  expect(screen.current.deck).toEqual(secondDeck);
  expect(screen.current.currentIndex).toBe(1);
  expect(screen.current.generating).toBe(false);
  expect(
    persisted.mock.calls.some(
      ([, materialId, value]) =>
        materialId === 'material-1' && value.title === 'obsolete-generation',
    ),
  ).toBe(false);
});

test('a genuinely missing online saved deck generates only once', async () => {
  setNetwork(true);
  cached.mockResolvedValue(null);
  saved.mockResolvedValue(null);
  const screen = await mount();
  expect(generated).toHaveBeenCalledTimes(1);
  expect(generated).toHaveBeenCalledWith('material-1', 8);
  expect(screen.current.currentCard?.front).toBe('generated question 1');
  expect(screen.current.busy).toBe(false);
});
