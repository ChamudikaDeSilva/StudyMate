import React from 'react';
import { Alert } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import AppButton from '../../src/components/common/AppButton';
import QuizQuestionCard from '../../src/components/quiz/QuizQuestionCard';
import QuizNavigation from '../../src/components/quiz/QuizNavigation';
import QuizReviewCard from '../../src/components/quiz/QuizReviewCard';
import QuizOption from '../../src/components/quiz/QuizOption';
import MaterialQuizScreen from '../../src/screens/ai/MaterialQuizScreen';
import MaterialQuizResultScreen from '../../src/screens/ai/MaterialQuizResultScreen';
import { useMaterialQuizScreen } from '../../src/hooks/useMaterialQuizScreen';
import {
  QuizAnswerResult,
  QuizSubmissionResult,
} from '../../src/domain/models/MaterialQuiz';

jest.mock('../../src/hooks/useMaterialQuizScreen', () => ({
  useMaterialQuizScreen: jest.fn(),
}));
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

const question = {
  id: 'question-1',
  position: 1,
  question: 'Which operation adds an item to a stack?',
  options: ['Pop', 'Push', 'Peek', 'Sort'],
};
const answer: QuizAnswerResult = {
  questionId: question.id,
  position: question.position,
  question: question.question,
  options: question.options,
  selectedIndex: 0,
  correctIndex: 1,
  isCorrect: false,
  explanation: 'Push adds an item to the top of a stack.',
};
const result: QuizSubmissionResult = {
  attemptId: 'attempt-1',
  quizId: 'quiz-1',
  score: 0,
  totalQuestions: 1,
  percentage: 0,
  answers: [answer],
};
const params = {
  materialId: 'material-1',
  subjectId: 'subject-1',
  subjectName: 'Algorithms',
  materialTitle: 'Stacks',
};
const mounted: ReactTestRenderer.ReactTestRenderer[] = [];
const render = (element: React.ReactElement) => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    renderer = ReactTestRenderer.create(element);
  });
  mounted.push(renderer);
  return renderer;
};
const visibleText = (renderer: ReactTestRenderer.ReactTestRenderer) => {
  const strings: string[] = [];
  const collect = (node: unknown): void => {
    if (typeof node === 'string') {
      strings.push(node);
    } else if (Array.isArray(node)) {
      node.forEach(collect);
    } else if (node && typeof node === 'object' && 'children' in node) {
      collect(node.children);
    }
  };
  collect(renderer.toJSON());
  return strings.join(' ').replace(/\s+/g, ' ').trim();
};
const getButton = (
  renderer: ReactTestRenderer.ReactTestRenderer,
  title: string,
) =>
  renderer.root
    .findAllByType(AppButton)
    .find(node => node.props.title === title)!;

beforeEach(() => {
  jest.clearAllMocks();
});
afterEach(() => {
  act(() => mounted.splice(0).forEach(renderer => renderer.unmount()));
  jest.restoreAllMocks();
});

test('question selection has persistent visible feedback and selects the option index', () => {
  const onSelect = jest.fn();
  const renderer = render(
    <QuizQuestionCard
      question={question}
      selectedIndex={1}
      onSelect={onSelect}
    />,
  );
  const selected = renderer.root.findAll(
    node =>
      node.props.accessibilityRole === 'radio' &&
      node.props.accessibilityState?.checked,
  )[0];
  expect(selected.props.accessibilityLabel).toBe('B. Push');
  expect(typeof selected.props.style).toBe('object');
  expect(selected.props.style.backgroundColor).toBe('#F0EDFF');
  expect(selected.props.style.borderColor).toBe('#5B4DE8');
  const first = renderer.root.findAll(
    node =>
      node.props.accessibilityRole === 'radio' &&
      node.props.accessibilityLabel === 'A. Pop',
  )[0];
  act(() => first.props.onPress());
  expect(onSelect).toHaveBeenCalledWith(0);

  act(() =>
    renderer.update(
      <QuizQuestionCard
        question={question}
        selectedIndex={0}
        onSelect={onSelect}
      />,
    ),
  );
  const newSelected = renderer.root.findAll(
    node =>
      node.props.accessibilityRole === 'radio' &&
      node.props.accessibilityState?.checked,
  )[0];
  expect(newSelected.props.accessibilityLabel).toBe('A. Pop');
});

test('navigation prevents unavailable moves and blocks duplicate submission while busy', () => {
  const renderer = render(
    <QuizNavigation
      canGoPrevious={false}
      canGoNext={false}
      isLastQuestion={false}
      submitting={false}
      onPrevious={jest.fn()}
      onNext={jest.fn()}
      onSubmit={jest.fn()}
    />,
  );
  expect(getButton(renderer, 'Previous').props.disabled).toBe(true);
  expect(getButton(renderer, 'Next').props.disabled).toBe(true);
  act(() =>
    renderer.update(
      <QuizNavigation
        canGoPrevious
        canGoNext={false}
        isLastQuestion
        submitting
        onPrevious={jest.fn()}
        onNext={jest.fn()}
        onSubmit={jest.fn()}
      />,
    ),
  );
  expect(getButton(renderer, 'Previous').props.disabled).toBe(true);
  expect(getButton(renderer, 'Submitting...').props.loading).toBe(true);
});

test('answer review identifies both the selected wrong answer and the correct explanation', () => {
  const renderer = render(<QuizReviewCard answer={answer} />);
  const options = renderer.root.findAllByType(QuizOption);
  expect(options[0].props).toMatchObject({
    state: 'incorrect',
    caption: 'Your answer',
  });
  expect(options[1].props).toMatchObject({
    state: 'correct',
    caption: 'Correct answer',
  });
  expect(visibleText(renderer)).toContain(answer.explanation);
  expect(options.every(option => option.props.onPress === undefined)).toBe(
    true,
  );
});

test('unanswered review keeps the correct answer and explicitly explains the skipped question', () => {
  const renderer = render(
    <QuizReviewCard answer={{ ...answer, selectedIndex: null }} />,
  );
  expect(visibleText(renderer)).toContain('You did not answer this question.');
  expect(
    renderer.root.findAllByType(QuizOption).map(option => option.props.state),
  ).toEqual(['default', 'correct', 'default', 'default']);
});

test('results retain the material navigation and request a freshly generated quiz', () => {
  const navigation = { pop: jest.fn(), replace: jest.fn() };
  type Props = React.ComponentProps<typeof MaterialQuizResultScreen>;
  const renderer = render(
    <MaterialQuizResultScreen
      navigation={navigation as unknown as Props['navigation']}
      route={{
        key: 'result',
        name: 'MaterialQuizResult',
        params: { ...params, result },
      }}
    />,
  );
  expect(visibleText(renderer)).toContain('0 of 1 correct');
  act(() => getButton(renderer, 'Try a new quiz').props.onPress());
  expect(navigation.replace).toHaveBeenCalledWith('MaterialQuiz', {
    ...params,
    forceGenerate: true,
  });
  act(() => getButton(renderer, 'Back to material').props.onPress());
  expect(navigation.pop).toHaveBeenCalledWith(2);
});

test('quiz submission retains unanswered confirmation and passes the result to review', async () => {
  const submitQuiz = jest.fn().mockResolvedValue(result);
  jest.mocked(useMaterialQuizScreen).mockReturnValue({
    quiz: { provider: 'test' },
    initializing: false,
    error: null,
    busy: false,
    currentQuestion: question,
    displayPosition: 1,
    totalQuestions: 1,
    answeredCount: 0,
    selectedIndex: null,
    canGoPrevious: false,
    canGoNext: false,
    isLastQuestion: true,
    submitting: false,
    submitQuiz,
    selectAnswer: jest.fn(),
    previous: jest.fn(),
    next: jest.fn(),
    retry: jest.fn(),
  } as unknown as ReturnType<typeof useMaterialQuizScreen>);
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const navigation = {
    navigate: jest.fn(),
    replace: jest.fn(),
    canGoBack: () => false,
  };
  type Props = React.ComponentProps<typeof MaterialQuizScreen>;
  const renderer = render(
    <MaterialQuizScreen
      navigation={navigation as unknown as Props['navigation']}
      route={{ key: 'quiz', name: 'MaterialQuiz', params }}
    />,
  );
  act(() => getButton(renderer, 'Submit quiz').props.onPress());
  expect(alert).toHaveBeenCalledWith(
    'Unanswered questions',
    'You still have 1 unanswered question. Submit anyway?',
    expect.any(Array),
  );
  expect(submitQuiz).not.toHaveBeenCalled();
  const buttons = alert.mock.calls[0][2]!;
  await act(async () => {
    buttons.find(button => button.text === 'Submit')!.onPress!();
  });
  expect(submitQuiz).toHaveBeenCalledTimes(1);
  expect(navigation.navigate).toHaveBeenCalledWith('MaterialQuizResult', {
    ...params,
    result,
  });
});
