import { z } from "zod";

export const QuestionTypeEnum = z.enum(["MCQ_SINGLE", "MCQ_MULTI", "NUMERIC"]);
export type QuestionType = z.infer<typeof QuestionTypeEnum>;

export const DifficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);
export type Difficulty = z.infer<typeof DifficultyEnum>;

export const RawQuestionSchema = z.object({
  id: z.string().min(1, "Question ID is required"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  difficulty: DifficultyEnum.default("MEDIUM"),
  type: QuestionTypeEnum,
  question: z.string().min(3, "Question text must be at least 3 characters"),
  options: z.array(z.string()).min(2, "At least 2 options required for MCQs").optional(),
  answer: z.union([
    z.number(),
    z.array(z.number()),
    z.string(),
  ]),
  marks: z.number().positive("Marks must be positive"),
  negativeMarks: z.number().min(0).default(0),
  explanation: z.string().min(1, "Detailed explanation is required"),
  image: z.string().optional(),
  pyqYear: z.number().optional(),
});

export const QuestionSchema = RawQuestionSchema.refine((data) => {
  if (data.type === "MCQ_SINGLE" || data.type === "MCQ_MULTI") {
    if (!data.options || data.options.length < 2) return false;
    if (data.type === "MCQ_SINGLE") {
      return typeof data.answer === "number" && data.answer >= 0 && data.answer < data.options.length;
    }
    if (data.type === "MCQ_MULTI") {
      return (
        Array.isArray(data.answer) &&
        data.answer.length > 0 &&
        data.answer.every((idx) => typeof idx === "number" && idx >= 0 && idx < data.options!.length)
      );
    }
  }
  return true;
}, {
  message: "Invalid options or answer format for question type",
});

export type Question = z.infer<typeof QuestionSchema>;

// Sanitized question delivered to client during the exam (Never leaks answers or explanations)
export const ClientQuestionSchema = RawQuestionSchema.omit({
  answer: true,
  explanation: true,
});

export type ClientQuestion = z.infer<typeof ClientQuestionSchema>;

export const SectionConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  questionIds: z.array(z.string().min(1)),
  marksPerQuestion: z.number().positive(),
  negativeMarks: z.number().min(0),
  type: QuestionTypeEnum,
});

export type SectionConfig = z.infer<typeof SectionConfigSchema>;

export const ExamConfigSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(["FULL_MOCK", "SECTIONAL", "PRACTICE"]).default("FULL_MOCK"),
  durationMinutes: z.number().positive(),
  totalQuestions: z.number().positive(),
  totalMarks: z.number().positive(),
  sections: z.array(SectionConfigSchema).min(1),
  rules: z.object({
    shuffleQuestions: z.boolean().default(false),
    shuffleOptions: z.boolean().default(false),
    allowCalculator: z.boolean().default(false),
    maxStrikes: z.number().default(3),
    autosaveIntervalSeconds: z.number().default(5),
  }),
});

export type ExamConfig = z.infer<typeof ExamConfigSchema>;

// User response for an individual question
export const AnswerItemSchema = z.object({
  selected: z.array(z.union([z.number(), z.string()])).default([]),
  markedForReview: z.boolean().default(false),
  timeSpentSeconds: z.number().default(0),
});

export type AnswerItem = z.infer<typeof AnswerItemSchema>;

// Full candidate session attempt state
export const AttemptSessionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  examConfigId: z.string().min(1),
  startedAt: z.number(), // Server timestamp in ms
  durationMinutes: z.number(),
  answers: z.record(z.string(), AnswerItemSchema).default({}),
  visitedQuestions: z.array(z.string()).default([]),
  currentQuestionId: z.string().optional(),
  warningsTriggered: z.number().default(0),
  status: z.enum(["IN_PROGRESS", "SUBMITTED", "AUTO_SUBMITTED", "EXPIRED"]).default("IN_PROGRESS"),
});

export type AttemptSession = z.infer<typeof AttemptSessionSchema>;

// Evaluation result schemas
export const QuestionReviewSchema = z.object({
  questionId: z.string(),
  question: ClientQuestionSchema,
  userSelected: z.array(z.union([z.number(), z.string()])),
  correctAnswer: z.union([z.number(), z.array(z.number()), z.string()]),
  isCorrect: z.boolean(),
  isPartial: z.boolean().default(false),
  marksAwarded: z.number(),
  maxMarks: z.number(),
  negativeMarks: z.number(),
  timeSpentSeconds: z.number(),
  explanation: z.string(),
});

export type QuestionReview = z.infer<typeof QuestionReviewSchema>;

export const SectionBreakdownSchema = z.object({
  sectionId: z.string(),
  name: z.string(),
  totalQuestions: z.number(),
  attempted: z.number(),
  correct: z.number(),
  incorrect: z.number(),
  partial: z.number(),
  unattempted: z.number(),
  marksObtained: z.number(),
  maxMarks: z.number(),
  timeSpentSeconds: z.number(),
});

export type SectionBreakdown = z.infer<typeof SectionBreakdownSchema>;

export const SubjectBreakdownSchema = z.object({
  subject: z.string(),
  totalQuestions: z.number(),
  attempted: z.number(),
  correct: z.number(),
  incorrect: z.number(),
  marksObtained: z.number(),
  maxMarks: z.number(),
  accuracyPercentage: z.number(),
});

export type SubjectBreakdown = z.infer<typeof SubjectBreakdownSchema>;

export const ExamResultSchema = z.object({
  id: z.string(),
  attemptId: z.string(),
  userId: z.string(),
  examConfigId: z.string(),
  examTitle: z.string(),
  startedAt: z.number(),
  submittedAt: z.number(),
  timeTakenSeconds: z.number(),
  totalScore: z.number(),
  maxMarks: z.number(),
  percentage: z.number(),
  accuracyPercentage: z.number(),
  totalQuestions: z.number(),
  attemptedCount: z.number(),
  correctCount: z.number(),
  incorrectCount: z.number(),
  partialCount: z.number(),
  unattemptedCount: z.number(),
  sections: z.array(SectionBreakdownSchema),
  subjects: z.array(SubjectBreakdownSchema),
  reviews: z.array(QuestionReviewSchema),
});

export type ExamResult = z.infer<typeof ExamResultSchema>;
