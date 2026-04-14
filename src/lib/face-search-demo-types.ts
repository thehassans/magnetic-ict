export type ApprovedFaceProfile = {
  id: string;
  name: string;
  title: string;
  summary: string;
  imageUrl: string;
  sourceUrl: string;
  consentNote: string;
  tags: string[];
};

export type FaceSearchMatch = ApprovedFaceProfile & {
  accuracy: number;
  score: number;
};
