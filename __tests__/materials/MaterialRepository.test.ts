import { apiRequest } from '../../src/data/remote/api/apiClient';
import { uploadMultipart } from '../../src/data/remote/api/multipartClient';
import { MaterialApiRepositoryImpl } from '../../src/data/repositories/MaterialApiRepositoryImpl';

jest.mock('../../src/data/remote/api/apiClient', () => ({
  apiRequest: jest.fn(),
}));
jest.mock('../../src/data/remote/api/multipartClient', () => ({
  uploadMultipart: jest.fn(),
}));

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(apiRequest).mockResolvedValue({});
});

test('a file title edit uses the shared title endpoint and sends no content or replacement file', async () => {
  const repository = new MaterialApiRepositoryImpl();

  await repository.updateMaterialTitle('42', '  Containers lecture  ');

  expect(apiRequest).toHaveBeenCalledTimes(1);
  const [endpoint, request] = jest.mocked(apiRequest).mock.calls[0];
  expect(endpoint).toBe('/materials/42/title');
  expect(request).toMatchObject({ method: 'PATCH', authenticated: true });
  expect(JSON.parse(request?.body as string)).toEqual({ title: 'Containers lecture' });
  expect(uploadMultipart).not.toHaveBeenCalled();
});

test('a replayed title edit remains bound to the captured account session', async () => {
  const repository = new MaterialApiRepositoryImpl('captured-account-session');

  await repository.updateMaterialTitle('42', 'Revised PDF title');

  expect(apiRequest).toHaveBeenCalledWith('/materials/42/title', {
    method: 'PATCH',
    authenticated: true,
    accessToken: 'captured-account-session',
    body: JSON.stringify({ title: 'Revised PDF title' }),
  });
});

test.each(['', ' ', '\n\t'])('a blank title %p is rejected before any request', async title => {
  const repository = new MaterialApiRepositoryImpl('captured-account-session');

  await expect(repository.updateMaterialTitle('42', title)).rejects.toThrow(
    'Material title is required.',
  );

  expect(apiRequest).not.toHaveBeenCalled();
  expect(uploadMultipart).not.toHaveBeenCalled();
});

test('the image-title compatibility method uses the shared authenticated title endpoint', async () => {
  const repository = new MaterialApiRepositoryImpl('captured-account-session');

  await repository.updateImageTitle('43', '  Revised camera note  ');

  expect(apiRequest).toHaveBeenCalledWith('/materials/43/title', {
    method: 'PATCH',
    authenticated: true,
    accessToken: 'captured-account-session',
    body: JSON.stringify({ title: 'Revised camera note' }),
  });
  expect(apiRequest).toHaveBeenCalledTimes(1);
  expect(uploadMultipart).not.toHaveBeenCalled();
});

test('a title update propagates a server error so the sync operation can remain queued', async () => {
  const failure = Object.assign(new Error('Session expired'), { status: 401 });
  jest.mocked(apiRequest).mockRejectedValue(failure);
  const repository = new MaterialApiRepositoryImpl('captured-account-session');

  await expect(repository.updateMaterialTitle('42', 'Revised title')).rejects.toBe(failure);

  expect(apiRequest).toHaveBeenCalledTimes(1);
  expect(uploadMultipart).not.toHaveBeenCalled();
});

test('text-note editing keeps its title-and-content contract separate from file-title edits', async () => {
  const repository = new MaterialApiRepositoryImpl('captured-account-session');

  await repository.updateMaterial('44', {
    title: '  Study notes  ',
    content: '  Updated explanation  ',
  });

  expect(apiRequest).toHaveBeenCalledWith('/materials/44', {
    method: 'PUT',
    authenticated: true,
    accessToken: 'captured-account-session',
    body: JSON.stringify({ title: 'Study notes', content: 'Updated explanation' }),
  });
});
