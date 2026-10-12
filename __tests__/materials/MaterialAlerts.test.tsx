import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Material } from '../../src/domain/models/Material';
import { useAppAlert } from '../../src/hooks/useAppAlert';
import { useAddMaterialScreen } from '../../src/hooks/useAddMaterialScreen';
import { useMaterialDetailsScreen } from '../../src/hooks/useMaterialDetailsScreen';
import { useMaterials } from '../../src/hooks/useMaterials';
import { useNetwork } from '../../src/hooks/useNetwork';
import { useOnlineGuard } from '../../src/hooks/useOnlineGuard';

jest.mock('../../src/hooks/useAppAlert', () => ({
  useAppAlert: jest.fn(),
}));
jest.mock('../../src/hooks/useMaterials', () => ({
  useMaterials: jest.fn(),
}));
jest.mock('../../src/hooks/useNetwork', () => ({
  useNetwork: jest.fn(),
}));
jest.mock('../../src/services/storage/PdfPickerService', () => ({
  PdfPickerService: jest.fn().mockImplementation(() => ({
    pickPdf: () => mockPickPdf(),
  })),
}));
jest.mock('../../src/services/storage/ImagePickerService', () => ({
  ImagePickerService: jest.fn().mockImplementation(() => ({
    pickImage: () => mockPickImage(),
    captureImage: () => mockCaptureImage(),
  })),
}));
jest.mock('react-native-css-interop', () => ({
  createInteropElement: require('react').createElement,
}));

const mockPickPdf = jest.fn();
const mockPickImage = jest.fn();
const mockCaptureImage = jest.fn();
const mockAlert = jest.fn<
  ReturnType<ReturnType<typeof useAppAlert>['alert']>,
  Parameters<ReturnType<typeof useAppAlert>['alert']>
>();
const material: Material = {
  id: 'material-1',
  userId: 'user-1',
  subjectId: 'subject-1',
  title: 'Stacks',
  content: 'Push adds an item to a stack.',
  sourceType: 'text',
  createdAt: 1,
  updatedAt: 1,
  syncStatus: 'synced',
};
const mounted: ReactTestRenderer.ReactTestRenderer[] = [];

const mountHook = <T,>(useHook: () => T) => {
  let current!: T;
  const Harness = () => {
    current = useHook();
    return null;
  };
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    renderer = ReactTestRenderer.create(<Harness />);
  });
  mounted.push(renderer);
  return {
    get current() {
      return current;
    },
    rerender: () => act(() => renderer.update(<Harness />)),
  };
};

const makeMaterials = () => ({
  materials: [material],
  loading: false,
  creating: false,
  updatingMaterialId: null,
  deletingMaterialId: null,
  error: null,
  loadMaterials: jest.fn(),
  createTextMaterial: jest.fn(),
  createPdfMaterial: jest.fn(),
  createImageMaterial: jest.fn(),
  updateTextMaterial: jest.fn(),
  updateImageTitle: jest.fn(),
  deleteMaterial: jest.fn(),
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAppAlert).mockReturnValue({ alert: mockAlert });
  jest
    .mocked(useMaterials)
    .mockReturnValue(
      makeMaterials() as unknown as ReturnType<typeof useMaterials>,
    );
});

afterEach(() => {
  act(() => mounted.splice(0).forEach(renderer => renderer.unmount()));
});

test('deleting a material waits for the themed confirmation before removing it', async () => {
  const materials = makeMaterials();
  jest
    .mocked(useMaterials)
    .mockReturnValue(materials as unknown as ReturnType<typeof useMaterials>);
  const onDeleted = jest.fn();
  const screen = mountHook(() =>
    useMaterialDetailsScreen({
      subjectId: material.subjectId,
      materialId: material.id,
      onDeleted,
    }),
  );

  act(() => screen.current.deleteCurrentMaterial());

  expect(mockAlert).toHaveBeenCalledWith(
    'Delete material',
    'Are you sure you want to delete "Stacks"?',
    expect.any(Array),
    { tone: 'danger', icon: 'delete' },
  );
  expect(materials.deleteMaterial).not.toHaveBeenCalled();
  const buttons = mockAlert.mock.calls[0][2]!;
  expect(
    buttons.find(button => button.text === 'Cancel')?.onPress,
  ).toBeUndefined();
  await act(async () => {
    await buttons.find(button => button.text === 'Delete')!.onPress!();
  });

  expect(materials.deleteMaterial).toHaveBeenCalledWith(material.id);
  expect(onDeleted).toHaveBeenCalledTimes(1);
});

test('failed deletion shows a follow-up themed error and keeps the material screen open', async () => {
  const materials = makeMaterials();
  materials.deleteMaterial.mockRejectedValue(
    new Error('Unable to sync deletion.'),
  );
  jest
    .mocked(useMaterials)
    .mockReturnValue(materials as unknown as ReturnType<typeof useMaterials>);
  const onDeleted = jest.fn();
  const screen = mountHook(() =>
    useMaterialDetailsScreen({
      subjectId: material.subjectId,
      materialId: material.id,
      onDeleted,
    }),
  );

  act(() => screen.current.deleteCurrentMaterial());
  await act(async () => {
    await mockAlert.mock.calls[0][2]!.find(button => button.text === 'Delete')!
      .onPress!();
  });

  expect(mockAlert).toHaveBeenLastCalledWith(
    'Unable to delete material',
    'Unable to sync deletion.',
    undefined,
    { tone: 'danger' },
  );
  expect(onDeleted).not.toHaveBeenCalled();
});

test('empty material edits show warnings and never call update', async () => {
  const materials = makeMaterials();
  jest
    .mocked(useMaterials)
    .mockReturnValue(materials as unknown as ReturnType<typeof useMaterials>);
  const screen = mountHook(() =>
    useMaterialDetailsScreen({
      subjectId: material.subjectId,
      materialId: material.id,
      onDeleted: jest.fn(),
    }),
  );

  act(() => screen.current.setTitle('   '));
  await act(async () => screen.current.saveMaterial());
  expect(mockAlert).toHaveBeenLastCalledWith(
    'Title required',
    'Please enter a material title.',
    undefined,
    { tone: 'warning' },
  );
  act(() => {
    screen.current.setTitle('Stacks');
    screen.current.setContent('   ');
  });
  await act(async () => screen.current.saveMaterial());
  expect(mockAlert).toHaveBeenLastCalledWith(
    'Content required',
    'Please enter study content.',
    undefined,
    { tone: 'warning' },
  );
  expect(materials.updateTextMaterial).not.toHaveBeenCalled();
});

test('oversized PDFs show a warning and leave selection ready for another file', async () => {
  mockPickPdf.mockResolvedValue({
    fileName: 'notes.pdf',
    localUri: 'file:///notes.pdf',
    size: 21 * 1024 * 1024,
  });
  const screen = mountHook(() =>
    useAddMaterialScreen({ subjectId: 'subject-1', onSaved: jest.fn() }),
  );

  await act(async () => screen.current.selectPdf());

  expect(mockAlert).toHaveBeenCalledWith(
    'PDF too large',
    'Please select a PDF smaller than 20 MB.',
    undefined,
    { tone: 'warning' },
  );
  expect(screen.current.selectedPdf).toBeNull();
  expect(screen.current.pickingPdf).toBe(false);
  expect(screen.current.busy).toBe(false);
});

test('picker errors use the themed error and release the busy state', async () => {
  mockPickImage.mockRejectedValue(new Error('Photo access is unavailable.'));
  const screen = mountHook(() =>
    useAddMaterialScreen({ subjectId: 'subject-1', onSaved: jest.fn() }),
  );

  await act(async () => screen.current.selectImage());

  expect(mockAlert).toHaveBeenCalledWith(
    'Unable to select image',
    'Photo access is unavailable.',
    undefined,
    { tone: 'danger' },
  );
  expect(screen.current.selectedImage).toBeNull();
  expect(screen.current.pickingImage).toBe(false);
  expect(screen.current.busy).toBe(false);
});

test('online actions show connection messages while checking or offline and run once connected', () => {
  const network = {
    isConnected: false,
    isInternetReachable: false,
    isOnline: false,
    connectionType: 'none',
    initialized: false,
  };
  jest.mocked(useNetwork).mockReturnValue(network);
  const guard = mountHook(useOnlineGuard);
  const action = jest.fn();

  act(() => guard.current.runOnlineAction('Quiz generation', action));
  expect(mockAlert).toHaveBeenLastCalledWith(
    'Checking connection',
    expect.any(String),
    undefined,
    { tone: 'info', icon: 'connection' },
  );
  network.initialized = true;
  guard.rerender();
  act(() => guard.current.runOnlineAction('Quiz generation', action));
  expect(mockAlert).toHaveBeenLastCalledWith(
    'Internet connection required',
    'Quiz generation needs an internet connection. Please reconnect and try again.',
    undefined,
    { tone: 'warning', icon: 'connection' },
  );
  expect(action).not.toHaveBeenCalled();
  network.isOnline = true;
  guard.rerender();
  act(() => guard.current.runOnlineAction('Quiz generation', action));
  expect(action).toHaveBeenCalledTimes(1);
});
