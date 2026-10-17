import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Platform } from 'react-native';
import { Subject } from '../../src/domain/models/Subject';
import { useSubjects } from '../../src/hooks/useSubjects';
import useAppAlert from '../../src/hooks/useAppAlert';
import { useSubjectsScreen } from '../../src/hooks/useSubjectsScreen';

jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', name: 'Chamz', email: 'chamz@example.com' },
  }),
}));

jest.mock('../../src/hooks/useSubjects', () => ({
  useSubjects: jest.fn(),
}));
let mockFocus: (() => (() => void) | undefined) | undefined;
let mockBlur: (() => void) | undefined;
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => (() => void) | undefined) => {
    mockFocus = callback;
    require('react').useEffect(() => {
      mockBlur = callback();
      return mockBlur;
    }, [callback]);
  },
}));

jest.mock('../../src/hooks/useAppAlert', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const subject: Subject = {
  id: 'subject-1',
  userId: 'user-1',
  name: 'Software engineering',
  description: 'Design principles',
  createdAt: 1,
  updatedAt: 1,
  syncStatus: 'synced',
};

const alert = jest.fn();
const createSubject = jest.fn();
const updateSubject = jest.fn();
const deleteSubject = jest.fn();
let screen!: ReturnType<typeof useSubjectsScreen>;
let renderer: ReactTestRenderer.ReactTestRenderer;

const Harness = () => {
  screen = useSubjectsScreen();
  return null;
};

beforeEach(() => {
  jest.clearAllMocks();
  createSubject.mockResolvedValue(subject);
  updateSubject.mockResolvedValue(subject);
  deleteSubject.mockResolvedValue(undefined);
  jest.mocked(useAppAlert).mockReturnValue({ alert });
  jest.mocked(useSubjects).mockReturnValue({
    subjects: [subject],
    loading: false,
    creating: false,
    updatingSubjectId: null,
    deletingSubjectId: null,
    error: null,
    loadSubjects: jest.fn(),
    createSubject,
    updateSubject,
    deleteSubject,
  });
  act(() => {
    renderer = ReactTestRenderer.create(<Harness />);
  });
});

afterEach(() => {
  act(() => renderer.unmount());
  jest.restoreAllMocks();
});

test('required-name feedback keeps the form open and does not save', async () => {
  act(() => screen.openCreateSubject());
  await act(async () => {
    await screen.saveSubject();
  });

  expect(alert).toHaveBeenCalledWith(
    'Subject name required',
    'Please enter a name for your subject.',
    undefined,
    { tone: 'warning' },
  );
  expect(screen.formVisible).toBe(true);
  expect(createSubject).not.toHaveBeenCalled();
});

test('returning to the subject list refreshes data without restoring a stale search or actions sheet', () => {
  expect(screen.loadSubjects).not.toHaveBeenCalled();
  act(() => {
    screen.setSearchText('old search');
    screen.openActions(subject);
  });
  act(() => mockBlur?.());
  expect(screen.searchText).toBe('');
  expect(screen.actionsVisible).toBe(false);
  expect(screen.selectedSubject).toBeNull();
  act(() => { mockFocus?.(); });
  expect(screen.loadSubjects).toHaveBeenCalledTimes(1);
});

test('save failure preserves entered values for correction and retry', async () => {
  createSubject.mockRejectedValueOnce(new Error('Please reconnect.'));
  act(() => {
    screen.openCreateSubject();
    screen.setName(' New subject ');
    screen.setDescription(' Study notes ');
  });
  await act(async () => {
    await screen.saveSubject();
  });

  expect(alert).toHaveBeenCalledWith(
    'Unable to create subject',
    'Please reconnect.',
    undefined,
    { tone: 'danger' },
  );
  expect(screen.formVisible).toBe(true);
  expect(screen.name).toBe(' New subject ');
  expect(screen.description).toBe(' Study notes ');

  await act(async () => {
    await screen.saveSubject();
  });
  expect(createSubject).toHaveBeenLastCalledWith('New subject', 'Study notes');
  expect(screen.formVisible).toBe(false);
  expect(screen.name).toBe('');
  expect(screen.description).toBe('');
});

test('delete confirmation closes the actions sheet without delaying or deleting', () => {
  const timer = jest.spyOn(globalThis, 'setTimeout');
  act(() => screen.openActions(subject));
  expect(screen.actionsVisible).toBe(true);

  act(() => screen.confirmDelete(subject));

  expect(screen.actionsVisible).toBe(false);
  expect(screen.selectedSubject).toBeNull();
  expect(alert).toHaveBeenCalledWith(
    'Delete Subject',
    'Are you sure you want to delete "Software engineering"?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: expect.any(Function) },
    ],
    { tone: 'danger', icon: 'delete' },
  );
  expect(deleteSubject).not.toHaveBeenCalled();
  expect(timer).not.toHaveBeenCalled();
  timer.mockRestore();
});

test('confirmed deletion uses the selected subject identity', async () => {
  act(() => screen.confirmDelete(subject));
  const buttons = alert.mock.calls[0][2];

  await act(async () => {
    await buttons[1].onPress();
  });

  expect(deleteSubject).toHaveBeenCalledTimes(1);
  expect(deleteSubject).toHaveBeenCalledWith(subject.id);
  expect(alert).toHaveBeenCalledTimes(1);
});

test('delete failure shows themed feedback without reopening subject actions', async () => {
  deleteSubject.mockRejectedValueOnce(new Error('The subject is busy.'));
  act(() => screen.confirmDelete(subject));
  const buttons = alert.mock.calls[0][2];

  await act(async () => {
    await buttons[1].onPress();
  });

  expect(alert).toHaveBeenLastCalledWith(
    'Unable to delete subject',
    'The subject is busy.',
    undefined,
    { tone: 'danger' },
  );
  expect(screen.actionsVisible).toBe(false);
});

test('editing on iOS waits for native sheet dismissal and preserves the draft', () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  act(() => screen.openActions(subject));
  act(() => screen.openEdit(subject));

  expect(screen.actionsVisible).toBe(false);
  expect(screen.formVisible).toBe(false);
  expect(screen.editingSubject).toBe(subject);
  expect(screen.name).toBe(subject.name);
  expect(screen.description).toBe(subject.description);

  act(() => screen.completeActionsDismissal());
  expect(screen.formVisible).toBe(true);

  act(() => screen.closeForm());
  act(() => screen.completeActionsDismissal());
  expect(screen.formVisible).toBe(false);
});

test.each(['cancel', 'delete'])(
  '%s cancels a pending edit before the iOS sheet finishes dismissing',
  action => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    act(() => screen.openActions(subject));
    act(() => screen.openEdit(subject));
    act(() => {
      if (action === 'delete') {
        screen.confirmDelete(subject);
      } else {
        screen.closeActions();
      }
      screen.completeActionsDismissal();
    });

    expect(screen.formVisible).toBe(false);
    expect(deleteSubject).not.toHaveBeenCalled();
  },
);

test('editing on Android opens immediately without a timer or dismissal callback', () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  act(() => screen.openActions(subject));
  act(() => screen.openEdit(subject));

  expect(screen.actionsVisible).toBe(false);
  expect(screen.formVisible).toBe(true);
  expect(screen.name).toBe(subject.name);
  expect(screen.description).toBe(subject.description);
});
