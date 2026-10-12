import { apiRequest } from '../../src/data/remote/api/apiClient';
import {
  changeCurrentPassword,
  loginUser,
  updateCurrentUser,
} from '../../src/data/remote/api/authService';
import { saveAccessToken } from '../../src/data/local/tokenStorage';

jest.mock('../../src/data/remote/api/apiClient', () => ({
  apiRequest: jest.fn(),
}));
jest.mock('../../src/data/local/tokenStorage', () => ({
  saveAccessToken: jest.fn(),
  clearAccessToken: jest.fn(),
}));

beforeEach(() => jest.resetAllMocks());

test('profile updates authenticate, normalize name/email, and preserve the current password', async () => {
  const response = {
    user: { id: 1 },
    access_token: 'refreshed-session',
    token_type: 'bearer',
  };
  jest.mocked(apiRequest).mockResolvedValue(response);
  expect(
    await updateCurrentUser({
      name: '  Alex Student  ',
      email: '  NEW@Example.COM ',
      current_password: ' current password ',
    }),
  ).toEqual(response);
  const [endpoint, request] = jest.mocked(apiRequest).mock.calls[0];
  expect(endpoint).toBe('/auth/me');
  expect(request?.method).toBe('PATCH');
  expect(request?.authenticated).toBe(true);
  expect(JSON.parse(request?.body as string)).toEqual({
    name: 'Alex Student',
    email: 'new@example.com',
    current_password: ' current password ',
  });
  expect(saveAccessToken).not.toHaveBeenCalled();
});

test('a name-only update omits reauthentication rather than sending an empty password', async () => {
  jest.mocked(apiRequest).mockResolvedValue({});
  await updateCurrentUser({ name: 'Alex', email: 'alex@example.com' });
  expect(
    JSON.parse(jest.mocked(apiRequest).mock.calls[0][1]?.body as string),
  ).toEqual({ name: 'Alex', email: 'alex@example.com' });
});

test('password change authenticates and preserves both passwords exactly', async () => {
  jest
    .mocked(apiRequest)
    .mockResolvedValue({ access_token: 'refreshed-session' });
  await changeCurrentPassword({
    current_password: ' old password ',
    new_password: ' new password ',
  });
  const [endpoint, request] = jest.mocked(apiRequest).mock.calls[0];
  expect(endpoint).toBe('/auth/change-password');
  expect(request?.method).toBe('POST');
  expect(request?.authenticated).toBe(true);
  expect(JSON.parse(request?.body as string)).toEqual({
    current_password: ' old password ',
    new_password: ' new password ',
  });
  expect(saveAccessToken).not.toHaveBeenCalled();
});

test('login returns the response for guarded persistence in the authentication context', async () => {
  const response = {
    user: { id: 1 },
    access_token: 'fresh-session',
    token_type: 'bearer',
  };
  jest.mocked(apiRequest).mockResolvedValue(response);
  expect(
    await loginUser({ email: 'alex@example.com', password: ' password ' }),
  ).toEqual(response);
  expect(saveAccessToken).not.toHaveBeenCalled();
});
