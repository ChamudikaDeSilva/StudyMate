import {
  API_CONFIG,
} from '../../../config/api';

import {
  getAccessToken,
} from '../../local/tokenStorage';


interface ApiRequestOptions
  extends RequestInit {
  authenticated?: boolean;
}


export class ApiError extends Error {
  status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
  }
}


export const apiRequest = async <T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const {
    authenticated = false,
    headers,
    ...requestOptions
  } = options;


  const requestHeaders =
    new Headers(headers);


  requestHeaders.set(
    'Accept',
    'application/json',
  );


  const isFormData =
    typeof FormData !==
      'undefined' &&
    requestOptions.body
      instanceof FormData;


  if (
    requestOptions.body &&
    !isFormData &&
    !requestHeaders.has(
      'Content-Type',
    )
  ) {
    requestHeaders.set(
      'Content-Type',
      'application/json',
    );
  }


  if (authenticated) {
    const token =
      await getAccessToken();


    if (!token) {
      throw new ApiError(
        'Authentication token is missing.',
        401,
      );
    }


    requestHeaders.set(
      'Authorization',
      `Bearer ${token}`,
    );
  }


  const response =
    await fetch(
      `${API_CONFIG.baseUrl}${endpoint}`,
      {
        ...requestOptions,
        headers: requestHeaders,
      },
    );


  const responseText =
    await response.text();


  if (!response.ok) {
    let message =
      'Something went wrong. Please try again.';


    if (responseText) {
      try {
        const errorBody =
          JSON.parse(
            responseText,
          );


        if (
          typeof errorBody.detail ===
          'string'
        ) {
          message =
            errorBody.detail;

        } else if (
          Array.isArray(
            errorBody.detail,
          )
        ) {
          message =
            errorBody.detail
              .map(
                (
                  item: {
                    msg?: string;
                  },
                ) =>
                  item.msg ??
                  'Validation error',
              )
              .join('\n');
        }

      } catch {
        message =
          responseText;
      }
    }


    throw new ApiError(
      message,
      response.status,
    );
  }


  if (
    response.status === 204 ||
    responseText.trim() === ''
  ) {
    return undefined as T;
  }


  try {
    return JSON.parse(
      responseText,
    ) as T;

  } catch {
    throw new ApiError(
      'The server returned an invalid JSON response.',
      response.status,
    );
  }
};
