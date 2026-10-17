import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getMaterialsCache,
  saveMaterialsCache,
  updateMaterialsCache,
} from '../../src/data/local/storage/offlineCache';
import {
  enqueueSyncOperation,
  getPendingSyncOperations,
  removeSyncOperation,
} from '../../src/data/local/sync/pendingSyncQueue';
import { MaterialApiRepositoryImpl } from '../../src/data/repositories/MaterialApiRepositoryImpl';
import { Material } from '../../src/domain/models/Material';
import { useAuth } from '../../src/hooks/useAuth';
import { useMaterials } from '../../src/hooks/useMaterials';
import { useNetwork } from '../../src/hooks/useNetwork';
import { offlineFileStorageService } from '../../src/services/offline/OfflineFileStorageService';

jest.mock('@react-native-async-storage/async-storage', () => {
  const storage = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: async (key: string) => storage.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: async (key: string) => {
        storage.delete(key);
      },
      clear: async () => storage.clear(),
    },
  };
});
jest.mock('../../src/data/repositories/MaterialApiRepositoryImpl', () => ({
  MaterialApiRepositoryImpl: jest.fn(),
}));
jest.mock('../../src/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('../../src/hooks/useNetwork', () => ({ useNetwork: jest.fn() }));
jest.mock('../../src/services/offline/OfflineFileStorageService', () => ({
  offlineFileStorageService: { deleteFile: jest.fn(), persistFile: jest.fn() },
}));
jest.mock('react-native-css-interop', () => ({
  createInteropElement: require('react').createElement,
}));

const userId = '1';
const subjectId = '10';
const material = (id: string, title = `Material ${id}`): Material => ({
  id,
  userId,
  subjectId,
  title,
  content: `Original contents for ${id}`,
  sourceType: 'text',
  createdAt: 1,
  updatedAt: 1,
  syncStatus: 'synced',
});
const repository = {
  getMaterials: jest.fn<Promise<Material[]>, [string, string]>(),
  createMaterial: jest.fn(),
  updateMaterial: jest.fn(),
  updateMaterialTitle: jest.fn(),
  deleteMaterial: jest.fn(),
};
const fileMaterial = (
  sourceType: 'pdf' | 'image' | 'camera',
  id = '11',
): Material => ({
  ...material(id),
  sourceType,
  content: undefined,
  fileName: sourceType === 'pdf' ? 'original-notes.pdf' : 'original-photo.jpg',
  fileUrl: `https://example.com/materials/${id}/file`,
});
const mounted: ReactTestRenderer.ReactTestRenderer[] = [];
let state!: ReturnType<typeof useMaterials>;
let isOnline = false;
let networkInitialized = true;

const ObserveMaterials = () => {
  state = useMaterials(subjectId);
  return null;
};
const renderHook = async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = ReactTestRenderer.create(<ObserveMaterials />);
  });
  mounted.push(renderer);
  return renderer;
};
const rerender = async (renderer: ReactTestRenderer.ReactTestRenderer) => {
  await act(async () => {
    renderer.update(<ObserveMaterials />);
  });
};
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((complete, fail) => {
    resolve = complete;
    reject = fail;
  });
  return { promise, resolve, reject };
};

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  isOnline = false;
  networkInitialized = true;
  jest.mocked(useAuth).mockReturnValue({
    user: { id: 1, name: 'Student', email: 'student@example.com' },
  } as ReturnType<typeof useAuth>);
  jest.mocked(useNetwork).mockImplementation(() => ({
    initialized: networkInitialized,
    isOnline,
    isConnected: isOnline,
    isInternetReachable: isOnline,
    connectionType: isOnline ? 'wifi' : 'none',
  }));
  jest.mocked(MaterialApiRepositoryImpl).mockImplementation(
    () => repository as unknown as MaterialApiRepositoryImpl,
  );
  repository.getMaterials.mockResolvedValue([]);
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  act(() => mounted.splice(0).forEach(renderer => renderer.unmount()));
  jest.restoreAllMocks();
});

test.each(['edit', 'rename file', 'delete', 'delete local material'] as const)(
  'an offline %s does not report completion before its material cache is persisted',
  async action => {
    const original = action === 'rename file'
      ? fileMaterial('pdf')
      : material(action === 'delete local material' ? 'local-material-11' : '11');
    await saveMaterialsCache(userId, subjectId, [original]);
    await renderHook();
    const writing = deferred<void>();
    const originalSetItem = AsyncStorage.setItem;
    let materialWriteStarted = false;
    let completed = false;
    jest.spyOn(AsyncStorage, 'setItem').mockImplementation(async (key, value) => {
      if (key.endsWith(':materials')) {
        materialWriteStarted = true;
        await writing.promise;
      }
      await originalSetItem(key, value);
    });

    let mutation!: Promise<void>;
    await act(async () => {
      mutation = (action === 'edit'
        ? state.updateTextMaterial(original.id, 'Revised title', 'Revised contents')
        : action === 'rename file'
          ? state.updateMaterialTitle(original.id, 'Revised file title')
          : state.deleteMaterial(original.id)
      ).then(() => {
        completed = true;
      });
    });

    try {
      expect(materialWriteStarted).toBe(true);
      expect(completed).toBe(false);
      expect(await getMaterialsCache(userId, subjectId)).toEqual([original]);
    } finally {
      // Release the simulated storage write even when a regression is found.
      await act(async () => {
        writing.resolve();
        await mutation;
      });
    }

    expect(completed).toBe(true);
    const persisted = await getMaterialsCache(userId, subjectId);
    if (action === 'edit') {
      expect(persisted).toEqual([
        expect.objectContaining({
          id: '11',
          title: 'Revised title',
          content: 'Revised contents',
          syncStatus: 'pending',
        }),
      ]);
    } else if (action === 'rename file') {
      expect(persisted).toEqual([{
        ...original,
        title: 'Revised file title',
        updatedAt: expect.any(Number),
        syncStatus: 'pending',
      }]);
    } else {
      expect(persisted).toEqual([]);
    }
    expect(repository.updateMaterial).not.toHaveBeenCalled();
    expect(repository.updateMaterialTitle).not.toHaveBeenCalled();
    expect(repository.deleteMaterial).not.toHaveBeenCalled();
  },
);

test('remounting offline retains the edited text and does not restore a deleted material', async () => {
  await saveMaterialsCache(userId, subjectId, [material('11'), material('12')]);
  const renderer = await renderHook();
  await act(async () => {
    await state.updateTextMaterial('11', 'Offline revision', 'New study notes');
    await state.deleteMaterial('12');
  });
  act(() => renderer.unmount());

  await renderHook();

  expect(state.materials).toEqual([
    expect.objectContaining({
      id: '11',
      title: 'Offline revision',
      content: 'New study notes',
      syncStatus: 'pending',
    }),
  ]);
  expect(await getPendingSyncOperations(userId)).toEqual([
    expect.objectContaining({
      entity: 'material',
      action: 'update',
      payload: expect.objectContaining({ materialId: '11', content: 'New study notes' }),
    }),
    expect.objectContaining({
      entity: 'material',
      action: 'delete',
      payload: { materialId: '12', subjectId },
    }),
  ]);
  expect(repository.getMaterials).not.toHaveBeenCalled();
});

test('a stale server refresh preserves pending local creates, edits, and deletes', async () => {
  const originals = [material('11'), material('12'), material('13')];
  await saveMaterialsCache(userId, subjectId, originals);
  const renderer = await renderHook();
  let local!: Material;
  await act(async () => {
    local = await state.createTextMaterial('Offline addition', 'Additional notes');
    await state.updateTextMaterial('11', 'Offline revision', 'Edited contents');
    await state.deleteMaterial('12');
  });

  repository.getMaterials.mockResolvedValue([...originals, material('14', 'New server material')]);
  isOnline = true;
  await rerender(renderer);

  expect(repository.getMaterials).toHaveBeenCalledWith(userId, subjectId);
  expect(state.materials).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: local.id, title: 'Offline addition', syncStatus: 'pending' }),
    expect.objectContaining({ id: '11', title: 'Offline revision', content: 'Edited contents', syncStatus: 'pending' }),
    material('13'),
    material('14', 'New server material'),
  ]));
  expect(state.materials).toHaveLength(4);
  expect(state.materials.some(item => item.id === '12')).toBe(false);
  expect(await getMaterialsCache(userId, subjectId)).toEqual(state.materials);
  expect(await getPendingSyncOperations(userId)).toHaveLength(3);

  act(() => renderer.unmount());
  isOnline = false;
  await renderHook();
  expect(state.materials.find(item => item.id === '11')?.content).toBe('Edited contents');
  expect(state.materials.some(item => item.id === '12')).toBe(false);
  expect(state.materials.some(item => item.id === local.id)).toBe(true);
});

test('a delayed server response cannot overwrite an edit made after the request started', async () => {
  await saveMaterialsCache(userId, subjectId, [material('11')]);
  const response = deferred<Material[]>();
  repository.getMaterials.mockReturnValue(response.promise);
  isOnline = true;
  const renderer = await renderHook();
  expect(repository.getMaterials).toHaveBeenCalledTimes(1);

  isOnline = false;
  await rerender(renderer);
  await act(async () => {
    await state.updateTextMaterial('11', 'Newest title', 'Saved after request began');
  });
  await act(async () => {
    response.resolve([material('11')]);
    await response.promise;
  });

  expect(state.materials).toEqual([
    expect.objectContaining({ id: '11', title: 'Newest title', content: 'Saved after request began' }),
  ]);
  expect(await getMaterialsCache(userId, subjectId)).toEqual(state.materials);
});

test('deleting a local material cancels its create and edits without removing another material operation', async () => {
  await enqueueSyncOperation(userId, {
    entity: 'material',
    action: 'delete',
    payload: { materialId: 'another-material', subjectId },
  });
  await renderHook();
  let local!: Material;
  await act(async () => {
    local = await state.createTextMaterial('Temporary note', 'Initial contents');
    await state.updateTextMaterial(local.id, 'Temporary revision', 'Updated contents');
    await state.deleteMaterial(local.id);
  });

  expect(state.materials).toEqual([]);
  expect(await getMaterialsCache(userId, subjectId)).toEqual([]);
  expect(await getPendingSyncOperations(userId)).toEqual([
    expect.objectContaining({
      entity: 'material',
      action: 'delete',
      payload: { materialId: 'another-material', subjectId },
    }),
  ]);
  expect(repository.createMaterial).not.toHaveBeenCalled();
  expect(repository.updateMaterial).not.toHaveBeenCalled();
  expect(repository.deleteMaterial).not.toHaveBeenCalled();
});

test.each(['edit', 'rename file', 'delete'] as const)(
  'a failed offline %s cache write reports failure and preserves its queued request',
  async action => {
    const original = action === 'rename file' ? fileMaterial('pdf') : material('11');
    await saveMaterialsCache(userId, subjectId, [original]);
    await renderHook();
    const originalSetItem = AsyncStorage.setItem;
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(AsyncStorage, 'setItem').mockImplementation(async (key, value) => {
      if (key.endsWith(':materials')) {
        throw new Error('Device storage is full.');
      }
      await originalSetItem(key, value);
    });

    await act(async () => {
      const mutation = action === 'edit'
        ? state.updateTextMaterial('11', 'Unsaved revision', 'New contents')
        : action === 'rename file'
          ? state.updateMaterialTitle('11', 'Unsaved file title')
          : state.deleteMaterial('11');
      await expect(mutation).rejects.toThrow('Device storage is full.');
    });

    expect(state.materials).toEqual([original]);
    expect(await getMaterialsCache(userId, subjectId)).toEqual([original]);
    expect(state.error).toBe('Device storage is full.');
    expect(state.updatingMaterialId).toBeNull();
    expect(state.deletingMaterialId).toBeNull();
    expect(await getPendingSyncOperations(userId)).toEqual([
      expect.objectContaining({
        action: action === 'delete' ? 'delete' : 'update',
        payload: expect.objectContaining({ materialId: '11', subjectId }),
        attempts: 0,
      }),
    ]);
  },
);

test('an edit and deletion requested together preserve both cache changes and queue entries', async () => {
  const originals = [material('11'), material('12')];
  await saveMaterialsCache(userId, subjectId, originals);
  await renderHook();
  const writing = deferred<void>();
  const originalSetItem = AsyncStorage.setItem;
  let firstMaterialWrite = true;
  jest.spyOn(AsyncStorage, 'setItem').mockImplementation(async (key, value) => {
    if (key.endsWith(':materials') && firstMaterialWrite) {
      firstMaterialWrite = false;
      await writing.promise;
    }
    await originalSetItem(key, value);
  });
  let mutations!: Promise<void[]>;
  let completed = 0;
  await act(async () => {
    mutations = Promise.all([
      state.updateTextMaterial('11', 'Concurrent revision', 'Revised study notes'),
      state.deleteMaterial('12'),
    ].map(mutation => mutation.then(() => {
      completed += 1;
    })));
  });

  try {
    expect(firstMaterialWrite).toBe(false);
    expect(completed).toBe(0);
    expect(await getMaterialsCache(userId, subjectId)).toEqual(originals);
  } finally {
    await act(async () => {
      writing.resolve();
      await mutations;
    });
  }

  expect(state.materials).toEqual([
    expect.objectContaining({ id: '11', title: 'Concurrent revision', content: 'Revised study notes' }),
  ]);
  expect(await getMaterialsCache(userId, subjectId)).toEqual(state.materials);
  expect(completed).toBe(2);
  expect(await getPendingSyncOperations(userId)).toEqual([
    expect.objectContaining({ action: 'update', payload: expect.objectContaining({ materialId: '11' }) }),
    expect.objectContaining({ action: 'delete', payload: { materialId: '12', subjectId } }),
  ]);
});

test('a stale response does not restore a deletion that finished synchronizing during its request', async () => {
  await saveMaterialsCache(userId, subjectId, [material('11'), material('12')]);
  const renderer = await renderHook();
  await act(async () => {
    await state.deleteMaterial('11');
  });
  const [deletion] = await getPendingSyncOperations(userId);
  const response = deferred<Material[]>();
  repository.getMaterials.mockReturnValue(response.promise);
  isOnline = true;
  await rerender(renderer);
  expect(repository.getMaterials).toHaveBeenCalledTimes(1);

  // Replay has completed the DELETE; its already-removed cache row stays absent.
  await removeSyncOperation(userId, deletion.id);
  expect(await getPendingSyncOperations(userId)).toEqual([]);
  await act(async () => {
    response.resolve([material('11'), material('12')]);
    await response.promise;
  });

  expect(state.materials).toEqual([material('12')]);
  expect(await getMaterialsCache(userId, subjectId)).toEqual([material('12')]);
});

test('a stale response preserves a create synchronized to its server ID during the request', async () => {
  await saveMaterialsCache(userId, subjectId, [material('11')]);
  const renderer = await renderHook();
  let local!: Material;
  await act(async () => {
    local = await state.createTextMaterial('Created offline', 'Offline contents');
  });
  const [creation] = await getPendingSyncOperations(userId);
  const response = deferred<Material[]>();
  repository.getMaterials.mockReturnValue(response.promise);
  isOnline = true;
  await rerender(renderer);
  expect(repository.getMaterials).toHaveBeenCalledTimes(1);

  const synchronized: Material = { ...local, id: '99', syncStatus: 'synced' };
  // These are the cache/queue effects of a successful CREATE replay.
  await updateMaterialsCache(userId, subjectId, current =>
    current.map(item => item.id === local.id ? synchronized : item),
  );
  await removeSyncOperation(userId, creation.id);
  expect(await getPendingSyncOperations(userId)).toEqual([]);
  await act(async () => {
    response.resolve([material('11')]);
    await response.promise;
  });

  expect(state.materials).toEqual(expect.arrayContaining([material('11'), synchronized]));
  expect(state.materials).toHaveLength(2);
  expect(state.materials.some(item => item.id === local.id)).toBe(false);
  expect(await getMaterialsCache(userId, subjectId)).toEqual(state.materials);
});

test.each(['edit', 'delete'] as const)(
  'a failed earlier request retains the newer offline %s instead of restoring old cached data',
  async action => {
    await saveMaterialsCache(userId, subjectId, [material('11')]);
    const response = deferred<Material[]>();
    repository.getMaterials.mockReturnValue(response.promise);
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    isOnline = true;
    const renderer = await renderHook();
    expect(repository.getMaterials).toHaveBeenCalledTimes(1);
    isOnline = false;
    await rerender(renderer);
    await act(async () => {
      if (action === 'edit') {
        await state.updateTextMaterial('11', 'Latest offline revision', 'Preserve this revision');
      } else {
        await state.deleteMaterial('11');
      }
    });
    const updatedCache = await getMaterialsCache(userId, subjectId);

    await act(async () => {
      response.reject(new Error('The server became unreachable.'));
      await response.promise.catch(() => {});
    });

    expect(state.materials).toEqual(updatedCache);
    expect(await getMaterialsCache(userId, subjectId)).toEqual(updatedCache);
    if (action === 'edit') {
      expect(state.materials[0].content).toBe('Preserve this revision');
    } else {
      expect(state.materials).toEqual([]);
    }
  },
);

test.each(['edit', 'delete'] as const)(
  'an online %s queues behind an older pending edit of the same material',
  async action => {
    await saveMaterialsCache(userId, subjectId, [material('11')]);
    const renderer = await renderHook();
    await act(async () => {
      await state.updateTextMaterial('11', 'First offline revision', 'First revision');
    });
    repository.getMaterials.mockResolvedValue([material('11')]);
    isOnline = true;
    await rerender(renderer);

    await act(async () => {
      if (action === 'edit') {
        await state.updateTextMaterial('11', 'Newer online revision', 'Second revision');
      } else {
        await state.deleteMaterial('11');
      }
    });

    expect(repository.updateMaterial).not.toHaveBeenCalled();
    expect(repository.deleteMaterial).not.toHaveBeenCalled();
    expect(await getPendingSyncOperations(userId)).toEqual([
      expect.objectContaining({
        action: 'update',
        payload: expect.objectContaining({ materialId: '11', content: 'First revision' }),
      }),
      expect.objectContaining({
        action: action === 'edit' ? 'update' : 'delete',
        payload: expect.objectContaining({ materialId: '11', subjectId }),
      }),
    ]);
    expect(await getMaterialsCache(userId, subjectId)).toEqual(state.materials);
    if (action === 'edit') {
      expect(state.materials[0]).toEqual(expect.objectContaining({
        title: 'Newer online revision', content: 'Second revision', syncStatus: 'pending',
      }));
    } else {
      expect(state.materials).toEqual([]);
    }
  },
);

test('a failed local-only deletion preserves its cached material and original create/edit queue', async () => {
  await renderHook();
  let local!: Material;
  await act(async () => {
    local = await state.createTextMaterial('Offline note', 'Original contents');
    await state.updateTextMaterial(local.id, 'Offline revision', 'Revised contents');
  });
  const originalCache = await getMaterialsCache(userId, subjectId);
  const originalQueue = await getPendingSyncOperations(userId);
  expect(originalQueue).toHaveLength(2);
  const originalSetItem = AsyncStorage.setItem;
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(AsyncStorage, 'setItem').mockImplementation(async (key, value) => {
    if (key.endsWith(':materials')) {
      throw new Error('Device storage is full.');
    }
    await originalSetItem(key, value);
  });

  await act(async () => {
    await expect(state.deleteMaterial(local.id)).rejects.toThrow('Device storage is full.');
  });

  expect(state.materials).toEqual(originalCache);
  expect(await getMaterialsCache(userId, subjectId)).toEqual(originalCache);
  expect(await getPendingSyncOperations(userId)).toEqual(originalQueue);
});

test.each(['pdf', 'image', 'camera'] as const)(
  'an offline %s title survives remount and stale refresh without changing its attachment',
  async sourceType => {
    const original = fileMaterial(sourceType);
    await saveMaterialsCache(userId, subjectId, [original]);
    const renderer = await renderHook();

    await act(async () => {
      await state.updateMaterialTitle(original.id, '  Revised study material  ');
    });
    const revised = {
      ...original,
      title: 'Revised study material',
      updatedAt: expect.any(Number),
      syncStatus: 'pending',
    };
    expect(state.materials).toEqual([revised]);
    expect(await getMaterialsCache(userId, subjectId)).toEqual([revised]);
    expect(await getPendingSyncOperations(userId)).toEqual([
      expect.objectContaining({
        entity: 'material',
        action: 'update',
        payload: {
          materialId: original.id,
          subjectId,
          title: 'Revised study material',
          kind: 'title',
        },
      }),
    ]);
    expect(repository.updateMaterialTitle).not.toHaveBeenCalled();
    expect(repository.updateMaterial).not.toHaveBeenCalled();

    act(() => renderer.unmount());
    const remounted = await renderHook();
    expect(state.materials).toEqual([revised]);
    repository.getMaterials.mockResolvedValue([original]);
    isOnline = true;
    await rerender(remounted);

    expect(state.materials).toEqual([revised]);
    expect(await getMaterialsCache(userId, subjectId)).toEqual([revised]);
    expect(offlineFileStorageService.persistFile).not.toHaveBeenCalled();
    expect(offlineFileStorageService.deleteFile).not.toHaveBeenCalled();
  },
);

test.each(['pdf', 'image', 'camera'] as const)(
  'an online %s title uses the metadata endpoint and reloads the updated material',
  async sourceType => {
    const original = fileMaterial(sourceType);
    const revised = { ...original, title: 'Updated online', updatedAt: 2 };
    repository.getMaterials.mockResolvedValueOnce([original]).mockResolvedValue([revised]);
    isOnline = true;
    await renderHook();

    await act(async () => {
      await state.updateMaterialTitle(original.id, '  Updated online  ');
    });

    expect(repository.updateMaterialTitle).toHaveBeenCalledTimes(1);
    expect(repository.updateMaterialTitle).toHaveBeenCalledWith(original.id, 'Updated online');
    expect(repository.updateMaterial).not.toHaveBeenCalled();
    expect(state.materials).toEqual([revised]);
    expect(await getMaterialsCache(userId, subjectId)).toEqual([revised]);
    expect(await getPendingSyncOperations(userId)).toEqual([]);
  },
);

test.each(['pdf', 'text'] as const)(
  'a successful online %s edit remains saved when the following refresh fails',
  async sourceType => {
    const original = sourceType === 'pdf' ? fileMaterial('pdf') : material('11');
    repository.getMaterials
      .mockResolvedValueOnce([original])
      .mockRejectedValue(new Error('The connection dropped during refresh.'));
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    isOnline = true;
    const renderer = await renderHook();

    await act(async () => {
      if (sourceType === 'pdf') {
        await state.updateMaterialTitle(original.id, 'Confirmed saved title');
      } else {
        await state.updateTextMaterial(original.id, 'Confirmed saved title', 'Confirmed saved notes');
      }
    });

    const saved = {
      ...original,
      title: 'Confirmed saved title',
      ...(sourceType === 'text' ? { content: 'Confirmed saved notes' } : {}),
      updatedAt: expect.any(Number),
      syncStatus: 'synced',
    };
    if (sourceType === 'pdf') {
      expect(repository.updateMaterialTitle).toHaveBeenCalledWith(original.id, 'Confirmed saved title');
    } else {
      expect(repository.updateMaterial).toHaveBeenCalledWith(original.id, {
        title: 'Confirmed saved title',
        content: 'Confirmed saved notes',
      });
    }
    expect(repository.getMaterials).toHaveBeenCalledTimes(2);
    expect(state.materials).toEqual([saved]);
    expect(await getMaterialsCache(userId, subjectId)).toEqual([saved]);
    expect(await getPendingSyncOperations(userId)).toEqual([]);

    act(() => renderer.unmount());
    isOnline = false;
    await renderHook();
    expect(state.materials).toEqual([saved]);
  },
);

test.each(['pdf', 'image'] as const)(
  'a newly saved offline %s can be renamed and deleted before its upload',
  async sourceType => {
    const fileName = sourceType === 'pdf' ? 'study-notes.pdf' : 'camera-capture.jpg';
    const mimeType = sourceType === 'pdf' ? 'application/pdf' : 'image/jpeg';
    const localPath = `/documents/offline/${fileName}`;
    jest.mocked(offlineFileStorageService.persistFile).mockResolvedValue({
      localPath,
      localUri: `file://${localPath}`,
      fileName,
      sourceType,
    });
    await renderHook();
    let created!: Material;
    await act(async () => {
      created = await (sourceType === 'pdf' ? state.createPdfMaterial : state.createImageMaterial)(
        'Original upload title', 'file:///temporary/source', fileName, mimeType,
      );
      await state.updateMaterialTitle(created.id, 'Renamed before upload');
    });

    expect(state.materials).toEqual([
      expect.objectContaining({
        id: created.id,
        title: 'Renamed before upload',
        sourceType,
        fileName,
        syncStatus: 'pending',
      }),
    ]);
    expect(await getPendingSyncOperations(userId)).toEqual([
      expect.objectContaining({
        action: 'create',
        payload: expect.objectContaining({
          localId: created.id,
          sourceType,
          localFilePath: localPath,
          fileName,
          mimeType,
        }),
      }),
      expect.objectContaining({
        action: 'update',
        payload: {
          materialId: created.id,
          subjectId,
          title: 'Renamed before upload',
          kind: 'title',
        },
      }),
    ]);

    await act(async () => {
      await state.deleteMaterial(created.id);
    });

    expect(state.materials).toEqual([]);
    expect(await getMaterialsCache(userId, subjectId)).toEqual([]);
    expect(await getPendingSyncOperations(userId)).toEqual([]);
    expect(repository.updateMaterialTitle).not.toHaveBeenCalled();
    expect(repository.deleteMaterial).not.toHaveBeenCalled();
  },
);

test('a file rename made online queues behind an earlier offline rename', async () => {
  const original = fileMaterial('pdf');
  await saveMaterialsCache(userId, subjectId, [original]);
  const renderer = await renderHook();
  await act(async () => {
    await state.updateMaterialTitle(original.id, 'First offline title');
  });
  repository.getMaterials.mockResolvedValue([original]);
  isOnline = true;
  await rerender(renderer);

  await act(async () => {
    await state.updateMaterialTitle(original.id, 'Newer online title');
  });

  expect(repository.updateMaterialTitle).not.toHaveBeenCalled();
  expect(await getPendingSyncOperations(userId)).toEqual([
    expect.objectContaining({
      payload: { materialId: original.id, subjectId, title: 'First offline title', kind: 'title' },
    }),
    expect.objectContaining({
      payload: { materialId: original.id, subjectId, title: 'Newer online title', kind: 'title' },
    }),
  ]);
  expect(state.materials).toEqual([
    { ...original, title: 'Newer online title', updatedAt: expect.any(Number), syncStatus: 'pending' },
  ]);
});

test('the existing image-title method also supports offline renaming', async () => {
  const original = fileMaterial('image');
  await saveMaterialsCache(userId, subjectId, [original]);
  await renderHook();

  await act(async () => {
    await state.updateImageTitle(original.id, 'Offline image title');
  });

  expect(state.materials[0]).toEqual({
    ...original,
    title: 'Offline image title',
    updatedAt: expect.any(Number),
    syncStatus: 'pending',
  });
  expect(repository.updateMaterialTitle).not.toHaveBeenCalled();
});

test('a file title saved before connectivity is known is persisted for later replay', async () => {
  const original = fileMaterial('pdf');
  await saveMaterialsCache(userId, subjectId, [original]);
  networkInitialized = false;
  isOnline = true;
  await renderHook();

  await act(async () => {
    await state.updateMaterialTitle(original.id, 'Saved while checking connection');
  });

  expect(repository.getMaterials).not.toHaveBeenCalled();
  expect(repository.updateMaterialTitle).not.toHaveBeenCalled();
  expect(await getMaterialsCache(userId, subjectId)).toEqual([{
    ...original,
    title: 'Saved while checking connection',
    updatedAt: expect.any(Number),
    syncStatus: 'pending',
  }]);
  expect(await getPendingSyncOperations(userId)).toEqual([
    expect.objectContaining({
      payload: {
        materialId: original.id,
        subjectId,
        title: 'Saved while checking connection',
        kind: 'title',
      },
    }),
  ]);
});

test.each([
  ['   ', 'Material title is required.'],
  ['x'.repeat(201), 'Material title must be 200 characters or fewer.'],
])('an invalid file title is rejected without changing cache or queue', async (title, message) => {
  const original = fileMaterial('pdf');
  await saveMaterialsCache(userId, subjectId, [original]);
  await renderHook();

  await act(async () => {
    await expect(state.updateMaterialTitle(original.id, title)).rejects.toThrow(message);
  });

  expect(await getMaterialsCache(userId, subjectId)).toEqual([original]);
  expect(await getPendingSyncOperations(userId)).toEqual([]);
  expect(repository.updateMaterialTitle).not.toHaveBeenCalled();
});
