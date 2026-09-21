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

import {Material} from '../../domain/models/Material';

import {
  CreateMaterialInput,
  MaterialRepository,
  UpdateMaterialInput,
} from '../../domain/repositories/MaterialRepository';

const firestore = getFirestore();

const MATERIALS_COLLECTION = 'materials';

export class MaterialRepositoryImpl
  implements MaterialRepository {

  // =========================================================
  // Get materials for one subject
  // =========================================================

  async getMaterials(
    userId: string,
    subjectId: string,
  ): Promise<Material[]> {
    const materialsQuery = query(
      collection(
        firestore,
        MATERIALS_COLLECTION,
      ),

      where(
        'userId',
        '==',
        userId,
      ),

      where(
        'subjectId',
        '==',
        subjectId,
      ),
    );

    const snapshot =
      await getDocs(materialsQuery);

    const materials: Material[] =
      snapshot.docs.map(document => {
        const data =
          document.data();

        return {
          id:
            document.id,

          userId:
            data.userId,

          subjectId:
            data.subjectId,

          title:
            data.title,

          sourceType:
            data.sourceType,

          content:
            data.content,

          fileName:
            data.fileName,

          fileUrl:
            data.fileUrl,

          createdAt:
            data.createdAt,

          updatedAt:
            data.updatedAt,

          syncStatus:
            'synced',
        };
      });

    return materials.sort(
      (a, b) =>
        b.createdAt -
        a.createdAt,
    );
  }

  // =========================================================
  // Create material
  // =========================================================

  async createMaterial(
    input: CreateMaterialInput,
  ): Promise<Material> {
    const now =
      Date.now();

    const materialData = {
      userId:
        input.userId,

      subjectId:
        input.subjectId,

      title:
        input.title.trim(),

      sourceType:
        input.sourceType,

      content:
        input.content?.trim() ?? '',

      fileName:
        input.fileName ?? '',

      fileUrl:
        input.fileUrl ?? '',

      createdAt:
        now,

      updatedAt:
        now,
    };

    const documentReference =
      await addDoc(
        collection(
          firestore,
          MATERIALS_COLLECTION,
        ),
        materialData,
      );

    return {
      id:
        documentReference.id,

      ...materialData,

      syncStatus:
        'synced',
    };
  }

  // =========================================================
  // Update material
  // =========================================================

  async updateMaterial(
    materialId: string,
    input: UpdateMaterialInput,
  ): Promise<void> {
    const materialReference =
      doc(
        firestore,
        MATERIALS_COLLECTION,
        materialId,
      );

    const updateData: {
      title: string;
      updatedAt: number;
      content?: string;
      fileName?: string;
      fileUrl?: string;
    } = {
      title:
        input.title.trim(),

      updatedAt:
        Date.now(),
    };

    /*
     * Only update optional fields
     * when they are actually supplied.
     *
     * This prevents existing values from
     * being accidentally replaced with
     * empty strings.
     */

    if (
      input.content !==
      undefined
    ) {
      updateData.content =
        input.content.trim();
    }

    if (
      input.fileName !==
      undefined
    ) {
      updateData.fileName =
        input.fileName;
    }

    if (
      input.fileUrl !==
      undefined
    ) {
      updateData.fileUrl =
        input.fileUrl;
    }

    await updateDoc(
      materialReference,
      updateData,
    );
  }

  // =========================================================
  // Delete material
  // =========================================================

  async deleteMaterial(
    materialId: string,
  ): Promise<void> {
    const materialReference =
      doc(
        firestore,
        MATERIALS_COLLECTION,
        materialId,
      );

    await deleteDoc(
      materialReference,
    );
  }
}