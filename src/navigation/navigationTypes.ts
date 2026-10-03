export type SubjectsStackParamList = {

  Subjects:
    undefined;


  SubjectMaterials: {
    subjectId:
      string;

    subjectName:
      string;
  };


  AddMaterial: {
    subjectId:
      string;

    subjectName:
      string;
  };


  MaterialDetails: {
    materialId:
      string;

    subjectId:
      string;

    subjectName:
      string;
  };


  PdfPreview: {
    materialId:
      string;

    subjectId:
      string;

    subjectName:
      string;

    title:
      string;
  };


  ImagePreview: {
    materialId:
      string;

    subjectId:
      string;

    subjectName:
      string;

    title:
      string;
  };
};