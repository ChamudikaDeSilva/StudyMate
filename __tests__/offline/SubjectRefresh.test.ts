import {PendingSyncOperation} from '../../src/data/local/sync/pendingSyncQueue';
import {reconcileSubjects} from '../../src/data/local/sync/reconcileSubjects';
import {Subject} from '../../src/domain/models/Subject';

const subject = (id: string, overrides: Partial<Subject> = {}): Subject => ({
  id,
  userId: '7',
  name: `Subject ${id}`,
  description: 'Original description',
  createdAt: 1,
  updatedAt: 1,
  syncStatus: 'synced',
  ...overrides,
});
const operation = (
  action: PendingSyncOperation['action'],
  payload: PendingSyncOperation['payload'],
  overrides: Partial<PendingSyncOperation> = {},
): PendingSyncOperation => ({
  id: `subject-${action}`,
  userId: '7',
  entity: 'subject',
  action,
  payload,
  createdAt: 2,
  attempts: 0,
  ...overrides,
});
const refresh = (overrides: Partial<Parameters<typeof reconcileSubjects>[0]> = {}) =>
  reconcileSubjects({
    userId: '7',
    remote: [subject('10')],
    cachedBefore: [subject('10')],
    cachedNow: [subject('10')],
    operationsBefore: [],
    operationsNow: [],
    ...overrides,
  });

test('a server deletion removes an unchanged synced subject from cache', () => {
  expect(refresh({remote: []})).toEqual([]);
});

test('an unchanged synced cache row receives new server details', () => {
  const remote = subject('10', {name: 'Updated on another device', updatedAt: 4});
  expect(refresh({remote: [remote]})).toEqual([remote]);
});

test('pending subject creation survives refresh and can be reconstructed from its queue entry', () => {
  const create = operation('create', {
    localId: 'local-subject-1',
    name: 'Offline subject',
    description: 'Saved without a connection',
  });
  expect(refresh({operationsNow: [create]})).toEqual([
    subject('10'),
    subject('local-subject-1', {
      name: 'Offline subject',
      description: 'Saved without a connection',
      createdAt: 2,
      updatedAt: 2,
      syncStatus: 'pending',
    }),
  ]);
});

test('pending updates override stale server details and retain local timestamps', () => {
  const edited = subject('10', {name: 'Offline title', updatedAt: 3, syncStatus: 'pending'});
  expect(refresh({
    cachedBefore: [edited],
    cachedNow: [edited],
    operationsNow: [operation('update', {subjectId: '10', name: 'Offline title'})],
  })).toEqual([{...edited, description: undefined}]);
});

test('pending deletion hides the subject even when it is still returned by the server', () => {
  expect(refresh({
    cachedBefore: [],
    cachedNow: [],
    operationsNow: [operation('delete', {subjectId: '10'})],
  })).toEqual([]);
});

test('multiple pending updates are applied in queue order', () => {
  expect(refresh({
    operationsNow: [
      operation('update', {subjectId: '10', name: 'First edit'}, {id: 'edit-1'}),
      operation('update', {subjectId: '10', name: 'Latest edit', description: 'Latest description'}, {id: 'edit-2'}),
    ],
  })).toEqual([subject('10', {
    name: 'Latest edit',
    description: 'Latest description',
    syncStatus: 'pending',
  })]);
});

test('an offline create followed by an edit and deletion remains absent', () => {
  expect(refresh({
    remote: [],
    cachedBefore: [],
    cachedNow: [],
    operationsNow: [
      operation('create', {localId: 'local-1', name: 'Offline title'}),
      operation('update', {subjectId: 'local-1', name: 'Edited title'}),
      operation('delete', {subjectId: 'local-1'}),
    ],
  })).toEqual([]);
});

test('a cache edit made during the request wins after its sync operation completes', () => {
  const edited = subject('10', {name: 'Synced newest title', updatedAt: 5});
  expect(refresh({cachedNow: [edited]})).toEqual([edited]);
});

test('a deletion completed during the request cannot be resurrected by its late server response', () => {
  expect(refresh({cachedNow: []})).toEqual([]);
});

test('an update queued before GET still wins when replay removes the entry without changing cached data', () => {
  const edited = subject('10', {name: 'Already edited', updatedAt: 3});
  expect(refresh({
    cachedBefore: [edited],
    cachedNow: [edited],
    operationsBefore: [operation('update', {subjectId: '10', name: 'Already edited'})],
  })).toEqual([edited]);
});

test('a deletion queued before GET remains hidden after replay clears the queue', () => {
  expect(refresh({
    cachedBefore: [],
    cachedNow: [],
    operationsBefore: [operation('delete', {subjectId: '10'})],
  })).toEqual([]);
});

test('a temporary subject remapped during GET retains one server row and no local duplicate', () => {
  const local = subject('local-1', {name: 'Created offline', syncStatus: 'pending'});
  const synced = subject('31', {name: 'Created offline', updatedAt: 5});
  expect(refresh({
    remote: [],
    cachedBefore: [local],
    cachedNow: [synced],
    operationsBefore: [operation('create', {localId: 'local-1', name: 'Created offline'})],
  })).toEqual([synced]);
});

test('operations from another account or the material queue cannot change subjects', () => {
  const otherAccountDelete = operation('delete', {subjectId: '10'}, {userId: '8'});
  const materialDelete = operation('delete', {materialId: '10', subjectId: '10'}, {entity: 'material'});
  expect(refresh({
    operationsBefore: [otherAccountDelete, materialDelete],
    operationsNow: [otherAccountDelete, materialDelete],
  })).toEqual([subject('10')]);
});

test('a row belonging to another account is excluded even if its ID matches a pending operation', () => {
  const otherAccount = subject('10', {userId: '8'});
  expect(refresh({
    remote: [otherAccount],
    cachedBefore: [otherAccount],
    cachedNow: [otherAccount],
    operationsNow: [operation('update', {subjectId: '10', name: 'Wrong account'})],
  })).toEqual([]);
});
