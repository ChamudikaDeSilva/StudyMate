import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';

import {Subject} from '../../domain/models/Subject';

import {
  CreateSubjectInput,
  SubjectRepository,
  UpdateSubjectInput,
} from '../../domain/repositories/SubjectRepository';

const firestore = getFirestore();

const SUBJECTS_COLLECTION = 'subjects';

export class SubjectRepositoryImpl
  implements SubjectRepository {

  async getSubjects(
    userId: string,
  ): Promise<Subject[]> {
    const subjectsQuery = query(
      collection(
        firestore,
        SUBJECTS_COLLECTION,
      ),
      where('userId', '==', userId),
    );

    const snapshot = await getDocs(
      subjectsQuery,
    );

    const subjects: Subject[] =
      snapshot.docs.map(document => {
        const data = document.data();

        return {
          id: document.id,
          userId: data.userId,
          name: data.name,
          description: data.description,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          syncStatus: 'synced',
        };
      });

    return subjects.sort(
      (a, b) =>
        b.createdAt - a.createdAt,
    );
  }

  async createSubject(
    input: CreateSubjectInput,
  ): Promise<Subject> {
    const now = Date.now();

    const subjectData = {
      userId: input.userId,
      name: input.name.trim(),
      description:
        input.description?.trim() ?? '',
      createdAt: now,
      updatedAt: now,
    };

    const documentReference =
      await addDoc(
        collection(
          firestore,
          SUBJECTS_COLLECTION,
        ),
        subjectData,
      );

    return {
      id: documentReference.id,
      ...subjectData,
      syncStatus: 'synced',
    };
  }

  async updateSubject(
    subjectId: string,
    input: UpdateSubjectInput,
  ): Promise<void> {
    const subjectReference = doc(
      firestore,
      SUBJECTS_COLLECTION,
      subjectId,
    );

    await updateDoc(
      subjectReference,
      {
        name: input.name.trim(),
        description:
          input.description?.trim() ?? '',
        updatedAt: Date.now(),
      },
    );
  }

  async deleteSubject(
    subjectId: string,
  ): Promise<void> {
    const subjectReference = doc(
      firestore,
      SUBJECTS_COLLECTION,
      subjectId,
    );

    await deleteDoc(subjectReference);
  }
}