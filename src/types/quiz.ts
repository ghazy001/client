export interface Reponse {
  _id: string;
  texte: string;
  question: string;
}

export interface Question {
  _id: string;
  contenu: string;
  score: number;
  correctAnswer: string;
  quiz: string;
  reponses: Reponse[];
}

export interface Quiz {
  _id: string;
  titre: string;
  description?: string;
  cours: string;
  questions: Question[];
  scores: { userId: string; score: number; submittedAt: Date; isTimedOut: boolean }[];
}