export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Subjects: undefined;
  Quiz: undefined;
  Profile: undefined;
};

export type SubjectsStackParamList = {
  SubjectsHome: undefined;
  SubjectMaterials: {
    subjectId: string;
    subjectName: string;
  };
  AddMaterial: {
    subjectId: string;
    subjectName: string;
  };
  MaterialDetails: {
    materialId: string;
    subjectId: string;
    subjectName: string;
  };
  PdfPreview: {
    materialId: string;
    subjectId: string;
    subjectName: string;
    title: string;
  };
  ImagePreview: {
    materialId: string;
    subjectId: string;
    subjectName: string;
    title: string;
  };
};
