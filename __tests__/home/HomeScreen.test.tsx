import React from 'react';
import { RefreshControl } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import AppButton from '../../src/components/common/AppButton';
import ActionButton from '../../src/components/common/ActionButton';
import HomeScreen from '../../src/screens/home/HomeScreen';
import { useAuth } from '../../src/hooks/useAuth';
import { useSubjects } from '../../src/hooks/useSubjects';
import { Subject } from '../../src/domain/models/Subject';

jest.mock('../../src/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('../../src/hooks/useAppAlert', () => ({
  useAppAlert: () => ({ alert: jest.fn() }),
}));
jest.mock('../../src/hooks/useSubjects', () => ({ useSubjects: jest.fn() }));

// Preserve NativeWind's JSX factory without depending on native styling.
jest.mock('react-native-css-interop', () => ({
  createInteropElement: require('react').createElement,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
}));

let mockFocusEffect: (() => void) | undefined;
jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => true,
  useFocusEffect: (callback: () => void) => {
    mockFocusEffect = callback;
    require('react').useEffect(callback, [callback]);
  },
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

const mockUseAuth = jest.mocked(useAuth);
const mockUseSubjects = jest.mocked(useSubjects);
const loadSubjects = jest.fn<Promise<void>, []>();
const mountedScreens: ReactTestRenderer.ReactTestRenderer[] = [];
type HomeProps = React.ComponentProps<typeof HomeScreen>;

const makeSubject = (id: string, name: string, updatedAt: number): Subject => ({
  id,
  name,
  userId: '1',
  description: `Notes for ${name}`,
  createdAt: 1,
  updatedAt,
  syncStatus: 'synced',
});

const subjects = [
  makeSubject('older', 'Algorithms', 10),
  makeSubject('newest', 'Software Architecture', 40),
  makeSubject('second', 'Databases', 30),
  makeSubject('third', 'Networks', 20),
];

const subjectState = (
  overrides: Partial<ReturnType<typeof useSubjects>> = {},
): ReturnType<typeof useSubjects> => ({
  subjects,
  loading: false,
  creating: false,
  updatingSubjectId: null,
  deletingSubjectId: null,
  error: null,
  loadSubjects,
  createSubject: jest.fn(),
  updateSubject: jest.fn(),
  deleteSubject: jest.fn(),
  ...overrides,
});

const renderScreen = () => {
  const navigation = { navigate: jest.fn() };
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  act(() => {
    renderer = ReactTestRenderer.create(
      <HomeScreen
        navigation={navigation as unknown as HomeProps['navigation']}
        route={{ key: 'home', name: 'Home' }}
      />,
    );
  });

  mountedScreens.push(renderer);
  return { renderer, navigation };
};

const getButtons = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  renderer.root.findAll(
    node =>
      node.props.accessibilityRole === 'button' &&
      typeof node.props.onPress === 'function',
  );

const getButton = (
  renderer: ReactTestRenderer.ReactTestRenderer,
  accessibilityLabel: string,
) => {
  const button =
    getButtons(renderer).find(
      node => node.props.accessibilityLabel === accessibilityLabel,
    ) ||
    renderer.root
      .findAllByType(AppButton)
      .find(node => node.props.title === accessibilityLabel) ||
    renderer.root
      .findAllByType(ActionButton)
      .find(node => node.props.title === accessibilityLabel);

  if (!button) {
    throw new Error(`No Home button labelled ${accessibilityLabel}`);
  }
  return button;
};

const getSubjectButtons = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  getButtons(renderer)
    .filter(
      node =>
        node.props.accessibilityLabel?.startsWith('Open ') &&
        node.props.accessibilityLabel !== 'Open account menu',
    )
    .filter(
      (node, index, buttons) =>
        buttons.findIndex(
          button =>
            button.props.accessibilityLabel === node.props.accessibilityLabel,
        ) === index,
    );

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

beforeEach(() => {
  jest.clearAllMocks();
  mockFocusEffect = undefined;
  loadSubjects.mockResolvedValue(undefined);
  mockUseAuth.mockReturnValue({
    user: {
      id: 1,
      name: 'Alex Student',
      email: 'alex@example.com',
      created_at: '',
      updated_at: '',
    },
    loading: false,
    sessionValidated: true,
    getSyncSession: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  });
  mockUseSubjects.mockReturnValue(subjectState());
});

afterEach(() => {
  act(() => mountedScreens.splice(0).forEach(renderer => renderer.unmount()));
});

test('the featured and recent subjects open their materials with the subject identity', () => {
  const { renderer, navigation } = renderScreen();
  const recentButtons = getSubjectButtons(renderer);

  expect(recentButtons.map(button => button.props.accessibilityLabel)).toEqual([
    'Open Software Architecture',
    'Open Databases',
    'Open Networks',
  ]);
  expect(
    getButtons(renderer).some(button =>
      button.props.accessibilityLabel?.startsWith('Options for '),
    ),
  ).toBe(false);

  const expectedSubjects = [subjects[1], subjects[2], subjects[3]];
  recentButtons.forEach((button, index) => {
    act(() => button.props.onPress());

    expect(navigation.navigate).toHaveBeenNthCalledWith(index + 1, 'Subjects', {
      screen: 'SubjectMaterials',
      params: {
        subjectId: expectedSubjects[index].id,
        subjectName: expectedSubjects[index].name,
      },
      initial: false,
    });
  });
  expect(navigation.navigate).toHaveBeenCalledTimes(3);
});

test('a library with one subject shows it once and still opens its materials', () => {
  const subject = {
    ...makeSubject('only', 'Mobile Development', 20),
    description: 'Week one lecture notes',
  };
  mockUseSubjects.mockReturnValue(subjectState({ subjects: [subject] }));
  const { renderer, navigation } = renderScreen();
  const subjectButtons = getSubjectButtons(renderer);

  expect(subjectButtons.map(button => button.props.accessibilityLabel)).toEqual(
    ['Open Mobile Development'],
  );
  expect(visibleText(renderer).split(subject.name)).toHaveLength(2);

  act(() => subjectButtons[0].props.onPress());

  expect(navigation.navigate).toHaveBeenCalledWith('Subjects', {
    screen: 'SubjectMaterials',
    params: { subjectId: subject.id, subjectName: subject.name },
    initial: false,
  });
});

test('browsing the library explicitly opens the subject list after opening a subject', () => {
  const { renderer, navigation } = renderScreen();

  act(() => getButton(renderer, 'Open Databases').props.onPress());
  act(() => getButton(renderer, 'Browse subjects').props.onPress());

  expect(navigation.navigate).toHaveBeenLastCalledWith('Subjects', {
    screen: 'SubjectsHome',
  });
});

test('the account menu opens the existing profile screen', () => {
  const { renderer, navigation } = renderScreen();

  act(() => getButton(renderer, 'Open account menu').props.onPress());
  expect(navigation.navigate).not.toHaveBeenCalled();
  act(() => getButton(renderer, 'View profile').props.onPress());

  expect(navigation.navigate).toHaveBeenCalledWith('Profile');
});

test('an empty library offers a working route to subjects', () => {
  mockUseSubjects.mockReturnValue(subjectState({ subjects: [] }));
  const { renderer, navigation } = renderScreen();

  expect(getSubjectButtons(renderer)).toHaveLength(0);
  expect(visibleText(renderer)).toContain('Create your first subject');
  act(() => getButton(renderer, 'Browse subjects').props.onPress());

  expect(navigation.navigate).toHaveBeenCalledWith('Subjects', {
    screen: 'SubjectsHome',
  });
});

test('a failed initial load offers retry and refreshes subjects', async () => {
  mockUseSubjects.mockReturnValue(
    subjectState({ subjects: [], error: 'Unable to load your subjects.' }),
  );
  const { renderer } = renderScreen();

  expect(visibleText(renderer)).toContain('Unable to load your subjects.');
  await act(async () => {
    await getButton(renderer, 'Retry loading subjects').props.onPress();
  });

  expect(loadSubjects).toHaveBeenCalledTimes(1);
});

test('cached subjects remain usable when refreshing fails', () => {
  mockUseSubjects.mockReturnValue(
    subjectState({ error: 'Unable to refresh your subjects.' }),
  );
  const { renderer, navigation } = renderScreen();

  expect(getSubjectButtons(renderer)).toHaveLength(3);
  act(() => getButton(renderer, 'Open Databases').props.onPress());

  expect(navigation.navigate).toHaveBeenCalledWith('Subjects', {
    screen: 'SubjectMaterials',
    params: { subjectId: 'second', subjectName: 'Databases' },
    initial: false,
  });
});

test('returning to Home refreshes recent subjects and avoids duplicate pending refreshes', async () => {
  const original = makeSubject('current', 'Old subject name', 1);
  const updated = makeSubject('current', 'Renamed subject', 2);
  let finishRequest!: () => void;
  const request = new Promise<void>(resolve => {
    finishRequest = resolve;
  });
  mockUseSubjects.mockImplementation(() => {
    const [currentSubjects, setCurrentSubjects] = React.useState([original]);
    loadSubjects.mockImplementation(async () => {
      await request;
      setCurrentSubjects([updated]);
    });
    return subjectState({ subjects: currentSubjects });
  });
  const { renderer } = renderScreen();

  expect(loadSubjects).not.toHaveBeenCalled();
  expect(getSubjectButtons(renderer)[0].props.accessibilityLabel).toBe(
    'Open Old subject name',
  );
  act(() => mockFocusEffect?.());

  expect(loadSubjects).toHaveBeenCalledTimes(1);
  expect(renderer.root.findByType(RefreshControl).props.refreshing).toBe(true);
  act(() => {
    renderer.root.findByType(RefreshControl).props.onRefresh();
  });
  expect(loadSubjects).toHaveBeenCalledTimes(1);

  await act(async () => {
    finishRequest();
    await request;
  });

  expect(getSubjectButtons(renderer)[0].props.accessibilityLabel).toBe(
    'Open Renamed subject',
  );
  expect(renderer.root.findByType(RefreshControl).props.refreshing).toBe(false);
});
