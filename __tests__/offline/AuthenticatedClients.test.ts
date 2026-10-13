import ReactNativeBlobUtil from 'react-native-blob-util';
import {apiRequest} from '../../src/data/remote/api/apiClient';
import {uploadMultipart} from '../../src/data/remote/api/multipartClient';
import {getAccessToken} from '../../src/data/local/tokenStorage';
import {SubjectApiRepositoryImpl} from '../../src/data/repositories/SubjectApiRepositoryImpl';
import {MaterialApiRepositoryImpl} from '../../src/data/repositories/MaterialApiRepositoryImpl';

jest.mock('react-native-blob-util', () => ({
  fetch: jest.fn(),
  wrap: (path: string) => path,
}));
jest.mock('../../src/data/local/tokenStorage', () => ({
  getAccessToken: jest.fn(),
}));

const originalFetch = globalThis.fetch;
const fetchMock = jest.fn();
const upload = {
  endpoint: '/subjects/1/materials/image',
  fields: {title: 'Lecture notes'},
  file: {
    uri: 'file:///notes.jpg',
    fileName: 'notes.jpg',
    mimeType: 'image/jpeg',
  },
};
const jsonResponse = (body: unknown) => ({
  ok: true,
  status: 200,
  text: async () => JSON.stringify(body),
});

beforeEach(() => {
  jest.resetAllMocks();
  globalThis.fetch = fetchMock;
  jest.mocked(getAccessToken).mockResolvedValue('account-b-token');
  fetchMock.mockResolvedValue(jsonResponse({}));
  jest.mocked(ReactNativeBlobUtil.fetch).mockResolvedValue({
    info: () => ({status: 200}),
    text: async () => '{}',
  } as never);
});
afterAll(() => {
  globalThis.fetch = originalFetch;
});

test('a captured JSON request token stays with account A after the stored account switches', async () => {
  await apiRequest('/subjects', {
    method: 'POST',
    authenticated: true,
    accessToken: 'account-a-token',
    body: JSON.stringify({name: 'Physics'}),
  });

  const request = fetchMock.mock.calls[0][1];
  expect(request.headers.get('Authorization')).toBe('Bearer account-a-token');
  expect(request.headers.get('Content-Type')).toBe('application/json');
  expect(request.accessToken).toBeUndefined();
  expect(getAccessToken).not.toHaveBeenCalled();
});

test('ordinary authenticated requests still read the stored session', async () => {
  await apiRequest('/subjects', {authenticated: true});
  expect(getAccessToken).toHaveBeenCalledTimes(1);
  expect(fetchMock.mock.calls[0][1].headers.get('Authorization')).toBe(
    'Bearer account-b-token',
  );
});

test('an empty supplied token cannot fall back to another account', async () => {
  await expect(
    apiRequest('/subjects', {authenticated: true, accessToken: ''}),
  ).rejects.toMatchObject({status: 401});
  await expect(uploadMultipart({...upload, accessToken: ''})).rejects.toMatchObject({
    status: 401,
  });
  expect(getAccessToken).not.toHaveBeenCalled();
  expect(fetchMock).not.toHaveBeenCalled();
  expect(ReactNativeBlobUtil.fetch).not.toHaveBeenCalled();
});

test('file uploads retain the captured account token', async () => {
  await uploadMultipart({...upload, accessToken: 'account-a-token'});
  expect(jest.mocked(ReactNativeBlobUtil.fetch).mock.calls[0][2]).toMatchObject({
    Authorization: 'Bearer account-a-token',
  });
  expect(getAccessToken).not.toHaveBeenCalled();
});

test('repositories carry the run token through subject and material creation', async () => {
  fetchMock.mockResolvedValue(
    jsonResponse({
      id: 1,
      subject_id: 1,
      name: 'Physics',
      title: 'Lecture',
      source_type: 'text',
      created_at: '2026-10-13T09:00:00Z',
      updated_at: '2026-10-13T09:00:00Z',
    }),
  );
  const subjects = new SubjectApiRepositoryImpl('account-a-token');
  const materials = new MaterialApiRepositoryImpl('account-a-token');
  await subjects.createSubject({userId: 'a', name: 'Physics'});
  await materials.createMaterial({
    userId: 'a',
    subjectId: '1',
    title: 'Lecture',
    content: 'Some notes',
    sourceType: 'text',
  });
  await materials.createImageMaterial({
    userId: 'a',
    subjectId: '1',
    title: 'Photo',
    fileUri: upload.file.uri,
    fileName: upload.file.fileName,
    mimeType: upload.file.mimeType,
  });

  expect(fetchMock).toHaveBeenCalledTimes(2);
  for (const [, request] of fetchMock.mock.calls) {
    expect(request.headers.get('Authorization')).toBe('Bearer account-a-token');
  }
  expect(jest.mocked(ReactNativeBlobUtil.fetch).mock.calls[0][2]).toMatchObject({
    Authorization: 'Bearer account-a-token',
  });
  expect(getAccessToken).not.toHaveBeenCalled();
});
