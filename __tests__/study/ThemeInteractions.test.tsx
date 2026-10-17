import React, { useState } from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import ActionButton from '../../src/components/common/ActionButton';
import FlashcardStudyCard from '../../src/components/flashcards/FlashcardStudyCard';
import MaterialFlashcardsScreen from '../../src/screens/ai/MaterialFlashcardsScreen';
import {
  Flashcard,
  MaterialFlashcards,
} from '../../src/domain/models/MaterialFlashcards';
import { useMaterialFlashcardsScreen } from '../../src/hooks/useMaterialFlashcardsScreen';

jest.mock('../../src/hooks/useMaterialFlashcardsScreen', () => ({
  useMaterialFlashcardsScreen: jest.fn(),
}));

// Run interactions through the real components without native styling.
jest.mock('react-native-css-interop', () => ({
  createInteropElement: require('react').createElement,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
}));

jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => true,
}));

jest.mock('lucide-react-native', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  const Icon = () => ReactModule.createElement(View);

  return new Proxy(
    { __esModule: true },
    { get: (_target, name) => (name === '__esModule' ? true : Icon) },
  );
});

const card: Flashcard = {
  id: 'card-1',
  position: 1,
  front: 'What does encapsulation protect?',
  back: 'The internal state of an object.',
};

const deck: MaterialFlashcards = {
  flashcardSetId: 'deck-1',
  materialId: 'material-1',
  title: 'Object-oriented design',
  sourceType: 'text',
  provider: 'gemini',
  cardCount: 2,
  cards: [card, { ...card, id: 'card-2', position: 2 }],
};

const mockUseScreen = jest.mocked(useMaterialFlashcardsScreen);
const mounted: ReactTestRenderer.ReactTestRenderer[] = [];
type ScreenState = ReturnType<typeof useMaterialFlashcardsScreen>;
type ScreenProps = React.ComponentProps<typeof MaterialFlashcardsScreen>;

const makeState = (overrides: Partial<ScreenState> = {}): ScreenState => ({
  deck,
  currentCard: card,
  currentIndex: 0,
  displayPosition: 1,
  totalCards: deck.cards.length,
  answerVisible: false,
  initializing: false,
  loading: false,
  generating: false,
  busy: false,
  error: null,
  canGoPrevious: false,
  canGoNext: true,
  toggleAnswer: jest.fn(),
  previous: jest.fn(),
  next: jest.fn(),
  generateAgain: jest.fn(),
  retry: jest.fn(),
  ...overrides,
});

const mount = (element: React.ReactElement) => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    renderer = ReactTestRenderer.create(element);
  });
  mounted.push(renderer);
  return renderer;
};

const renderScreen = (canGoBack = true) => {
  const navigation = {
    canGoBack: jest.fn(() => canGoBack),
    goBack: jest.fn(),
    replace: jest.fn(),
  };
  const renderer = mount(
    <MaterialFlashcardsScreen
      navigation={navigation as unknown as ScreenProps['navigation']}
      route={{
        key: 'flashcards',
        name: 'MaterialFlashcards',
        params: {
          materialId: 'material-1',
          subjectId: 'subject-1',
          subjectName: 'Software engineering',
          materialTitle: 'Object-oriented design',
        },
      }}
    />,
  );
  return { renderer, navigation };
};

const labeledButton = (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) => {
  const button = renderer.root.findAll(
    node =>
      node.props.accessibilityRole === 'button' &&
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0];
  if (!button) {
    throw new Error(`No button labelled ${label}`);
  }
  return button;
};

const actionButton = (
  renderer: ReactTestRenderer.ReactTestRenderer,
  title: string,
) => {
  const component = renderer.root
    .findAllByType(ActionButton)
    .find(node => node.props.title === title);
  const button = component?.findAll(
    node =>
      node.props.accessibilityRole === 'button' &&
      typeof node.props.onPress === 'function',
  )[0];
  if (!button) {
    throw new Error(`No action titled ${title}`);
  }
  return button;
};

const visibleText = (renderer: ReactTestRenderer.ReactTestRenderer) => {
  const text: string[] = [];
  const collect = (node: unknown): void => {
    if (typeof node === 'string') {
      text.push(node);
    } else if (Array.isArray(node)) {
      node.forEach(collect);
    } else if (node && typeof node === 'object' && 'children' in node) {
      collect(node.children);
    }
  };
  collect(renderer.toJSON());
  return text.join(' ');
};

const StudyCardHarness = () => {
  const [answerVisible, setAnswerVisible] = useState(false);
  return (
    <FlashcardStudyCard
      card={card}
      answerVisible={answerVisible}
      onToggle={() => setAnswerVisible(value => !value)}
    />
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseScreen.mockReturnValue(makeState());
});

afterEach(() => {
  act(() => mounted.splice(0).forEach(renderer => renderer.unmount()));
});

test('repeated flashcard flips keep the visible face and accessibility content in sync', () => {
  const renderer = mount(<StudyCardHarness />);

  for (let cycle = 0; cycle < 12; cycle += 1) {
    expect(visibleText(renderer)).toContain(card.front);
    expect(visibleText(renderer)).not.toContain(card.back);
    expect(
      labeledButton(renderer, 'Reveal flashcard answer').props.accessibilityValue,
    ).toEqual({ text: card.front });

    act(() => labeledButton(renderer, 'Reveal flashcard answer').props.onPress());

    expect(visibleText(renderer)).toContain(card.back);
    expect(visibleText(renderer)).not.toContain(card.front);
    expect(
      labeledButton(renderer, 'Hide flashcard answer').props.accessibilityValue,
    ).toEqual({ text: card.back });

    act(() => labeledButton(renderer, 'Hide flashcard answer').props.onPress());
  }

  expect(visibleText(renderer)).toContain(card.front);
  expect(visibleText(renderer)).not.toContain(card.back);
});

test('navigation respects deck boundaries and calls the screen actions', () => {
  const state = makeState();
  mockUseScreen.mockReturnValue(state);
  const { renderer } = renderScreen();

  expect(
    actionButton(renderer, 'Previous').props.accessibilityState.disabled,
  ).toBe(true);
  expect(
    actionButton(renderer, 'Next card').props.accessibilityState.disabled,
  ).toBe(false);
  act(() => actionButton(renderer, 'Next card').props.onPress());
  act(() => labeledButton(renderer, 'Reveal flashcard answer').props.onPress());

  expect(state.next).toHaveBeenCalledTimes(1);
  expect(state.toggleAnswer).toHaveBeenCalledTimes(1);
  expect(state.previous).not.toHaveBeenCalled();
});

test('the final card permits going back and disables going past the deck', () => {
  const state = makeState({
    currentIndex: 1,
    displayPosition: 2,
    canGoPrevious: true,
    canGoNext: false,
  });
  mockUseScreen.mockReturnValue(state);
  const { renderer } = renderScreen();

  expect(
    actionButton(renderer, 'Previous').props.accessibilityState.disabled,
  ).toBe(false);
  expect(
    actionButton(renderer, 'Next card').props.accessibilityState.disabled,
  ).toBe(true);
  act(() => actionButton(renderer, 'Previous').props.onPress());

  expect(state.previous).toHaveBeenCalledTimes(1);
  expect(state.next).not.toHaveBeenCalled();
});

test('refreshing uses generation and prevents another request while busy', () => {
  const state = makeState();
  mockUseScreen.mockReturnValue(state);
  const { renderer } = renderScreen();

  act(() => actionButton(renderer, 'Refresh flashcards').props.onPress());
  expect(state.generateAgain).toHaveBeenCalledTimes(1);

  mockUseScreen.mockReturnValue(makeState({ generating: true, busy: true }));
  const busyScreen = renderScreen().renderer;
  expect(
    actionButton(busyScreen, 'Refresh flashcards').props.accessibilityState,
  ).toEqual({
    disabled: true,
    busy: true,
  });
});

test('an empty saved deck has a working create action', () => {
  const state = makeState({
    deck: { ...deck, cardCount: 0, cards: [] },
    currentCard: null,
    totalCards: 0,
    displayPosition: 0,
    canGoNext: false,
  });
  mockUseScreen.mockReturnValue(state);
  const { renderer } = renderScreen();

  expect(visibleText(renderer)).toContain('This deck has no cards');
  act(() => actionButton(renderer, 'Create flashcards').props.onPress());
  expect(state.generateAgain).toHaveBeenCalledTimes(1);
});

test('an unavailable deck preserves the supplied error and retries loading', () => {
  const state = makeState({
    deck: null,
    currentCard: null,
    error: 'No saved deck is available offline.',
  });
  mockUseScreen.mockReturnValue(state);
  const { renderer } = renderScreen();

  expect(visibleText(renderer)).toContain(state.error);
  act(() => actionButton(renderer, 'Try again').props.onPress());
  expect(state.retry).toHaveBeenCalledTimes(1);
  expect(state.generateAgain).not.toHaveBeenCalled();
});

test('back returns through navigation history when available', () => {
  const { renderer, navigation } = renderScreen();

  act(() => labeledButton(renderer, 'Go back').props.onPress());

  expect(navigation.goBack).toHaveBeenCalledTimes(1);
  expect(navigation.replace).not.toHaveBeenCalled();
});

test('back restores the original material when there is no navigation history', () => {
  const { renderer, navigation } = renderScreen(false);

  act(() => labeledButton(renderer, 'Go back').props.onPress());

  expect(navigation.replace).toHaveBeenCalledWith('MaterialDetails', {
    materialId: 'material-1',
    subjectId: 'subject-1',
    subjectName: 'Software engineering',
  });
  expect(navigation.goBack).not.toHaveBeenCalled();
});
