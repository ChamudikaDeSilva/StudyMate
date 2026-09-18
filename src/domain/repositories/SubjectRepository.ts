import {Subject} from '../models/Subject';

export interface CreateSubjectInput {
  userId: string;
  name: string;
  description?: string;
}

export interface UpdateSubjectInput {
  name: string;
  description?: string;
}

export interface SubjectRepository {
  getSubjects(userId: string): Promise<Subject[]>;

  createSubject(
    input: CreateSubjectInput,
  ): Promise<Subject>;

  updateSubject(
    subjectId: string,
    input: UpdateSubjectInput,
  ): Promise<void>;

  deleteSubject(subjectId: string): Promise<void>;
}