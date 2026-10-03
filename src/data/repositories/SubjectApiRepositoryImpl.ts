import {
  Subject,
} from '../../domain/models/Subject';

import {
  CreateSubjectInput,
  SubjectRepository,
  UpdateSubjectInput,
} from '../../domain/repositories/SubjectRepository';

import {
  apiRequest,
} from '../remote/api/apiClient';


interface SubjectApiResponse {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}


const mapSubject = (
  response: SubjectApiResponse,
  userId: string,
): Subject => {
  return {
    id: String(response.id),

    userId,

    name: response.name,

    description:
      response.description ??
      undefined,

    createdAt:
      new Date(
        response.created_at,
      ).getTime(),

    updatedAt:
      new Date(
        response.updated_at,
      ).getTime(),

    syncStatus: 'synced',
  };
};


export class SubjectApiRepositoryImpl
  implements SubjectRepository {

  async getSubjects(
    userId: string,
  ): Promise<Subject[]> {
    const response =
      await apiRequest<
        SubjectApiResponse[]
      >(
        '/subjects',
        {
          method: 'GET',
          authenticated: true,
        },
      );

    return response.map(
      subject =>
        mapSubject(
          subject,
          userId,
        ),
    );
  }


  async createSubject(
    input: CreateSubjectInput,
  ): Promise<Subject> {
    const response =
      await apiRequest<
        SubjectApiResponse
      >(
        '/subjects',
        {
          method: 'POST',
          authenticated: true,

          body: JSON.stringify({
            name: input.name,

            description:
              input.description ??
              null,
          }),
        },
      );

    return mapSubject(
      response,
      input.userId,
    );
  }


  async updateSubject(
    subjectId: string,
    input: UpdateSubjectInput,
  ): Promise<void> {
    await apiRequest<
      SubjectApiResponse
    >(
      `/subjects/${subjectId}`,
      {
        method: 'PUT',
        authenticated: true,

        body: JSON.stringify({
          name: input.name,

          description:
            input.description ??
            null,
        }),
      },
    );
  }


  async deleteSubject(
    subjectId: string,
  ): Promise<void> {
    await apiRequest<void>(
      `/subjects/${subjectId}`,
      {
        method: 'DELETE',
        authenticated: true,
      },
    );
  }
}