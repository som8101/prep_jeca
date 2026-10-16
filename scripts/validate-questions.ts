import fs from "fs";
import path from "path";
import { QuestionSchema, ExamConfigSchema, Question, ExamConfig } from "../app/lib/mock/schemas";

const QUESTIONS_DIR = path.join(process.cwd(), "content", "questions");
const EXAMS_DIR = path.join(process.cwd(), "content", "exams");

interface ValidationStats {
  filesChecked: number;
  totalQuestions: number;
  totalExams: number;
  bySubject: Record<string, number>;
  byType: Record<string, number>;
  errors: string[];
}

const stats: ValidationStats = {
  filesChecked: 0,
  totalQuestions: 0,
  totalExams: 0,
  bySubject: {},
  byType: {},
  errors: [],
};

const seenQuestionIds = new Set<string>();
const questionMap = new Map<string, Question>();

console.log("\x1b[36m%s\x1b[0m", "=================================================");
console.log("\x1b[36m%s\x1b[0m", "   JECA PrepHub: Question Bank & Exam Validator   ");
console.log("\x1b[36m%s\x1b[0m", "=================================================\n");

// 1. Validate Question Bank Files
if (!fs.existsSync(QUESTIONS_DIR)) {
  console.error(`\x1b[31m[ERROR] Questions directory not found: ${QUESTIONS_DIR}\x1b[0m`);
  process.exit(1);
}

const questionFiles = fs.readdirSync(QUESTIONS_DIR).filter((f) => f.endsWith(".json"));

for (const file of questionFiles) {
  const filePath = path.join(QUESTIONS_DIR, file);
  stats.filesChecked++;
  try {
    const rawData = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(rawData);

    if (!Array.isArray(parsed)) {
      stats.errors.push(`${file}: Root element must be an array of questions.`);
      continue;
    }

    parsed.forEach((item, index) => {
      const result = QuestionSchema.safeParse(item);
      if (!result.success) {
        const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
        stats.errors.push(`${file} [Question index ${index}, id: ${item.id || "unknown"}]: ${issues}`);
        return;
      }

      const q = result.data;
      if (seenQuestionIds.has(q.id)) {
        stats.errors.push(`${file}: Duplicate question ID detected "${q.id}"`);
      } else {
        seenQuestionIds.add(q.id);
        questionMap.set(q.id, q);
      }

      stats.totalQuestions++;
      stats.bySubject[q.subject] = (stats.bySubject[q.subject] || 0) + 1;
      stats.byType[q.type] = (stats.byType[q.type] || 0) + 1;
    });

    console.log(`\x1b[32m✔ [OK]\x1b[0m ${file} (${parsed.length} questions parsed)`);
  } catch (err: any) {
    stats.errors.push(`${file}: Failed to read/parse JSON: ${err.message}`);
  }
}

// 2. Validate Exam Config Files
if (fs.existsSync(EXAMS_DIR)) {
  const examFiles = fs.readdirSync(EXAMS_DIR).filter((f) => f.endsWith(".json"));
  for (const file of examFiles) {
    const filePath = path.join(EXAMS_DIR, file);
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      const result = ExamConfigSchema.safeParse(parsed);
      if (!result.success) {
        const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
        stats.errors.push(`${file} [Exam Config]: ${issues}`);
        continue;
      }

      const exam: ExamConfig = result.data;
      stats.totalExams++;

      // Check that all questionIds exist in the question bank
      let missingCount = 0;
      let totalQuestionsInExam = 0;
      for (const section of exam.sections) {
        totalQuestionsInExam += section.questionIds.length;
        for (const qId of section.questionIds) {
          if (!questionMap.has(qId)) {
            missingCount++;
            stats.errors.push(`${file}: Section "${section.name}" references non-existent question "${qId}"`);
          }
        }
      }

      if (totalQuestionsInExam !== exam.totalQuestions) {
        stats.errors.push(
          `${file}: Exam specifies totalQuestions=${exam.totalQuestions}, but sum of sections is ${totalQuestionsInExam}`
        );
      }

      if (missingCount === 0) {
        console.log(`\x1b[32m✔ [OK]\x1b[0m Exam: ${exam.title} (${exam.totalQuestions} questions referenced)`);
      }
    } catch (err: any) {
      stats.errors.push(`${file}: Exam JSON error: ${err.message}`);
    }
  }
}

// 3. Print Summary
console.log("\n-------------------------------------------------");
console.log(`Total Question Files: ${stats.filesChecked}`);
console.log(`Total Valid Questions: ${stats.totalQuestions}`);
console.log(`Total Valid Exams: ${stats.totalExams}`);

console.log("\nBreakdown by Question Type:");
for (const [type, count] of Object.entries(stats.byType)) {
  console.log(`  • ${type}: ${count}`);
}

console.log("\nBreakdown by Subject:");
for (const [subj, count] of Object.entries(stats.bySubject)) {
  console.log(`  • ${subj}: ${count}`);
}
console.log("-------------------------------------------------");

if (stats.errors.length > 0) {
  console.error(`\n\x1b[31mValidation Failed with ${stats.errors.length} error(s):\x1b[0m`);
  stats.errors.forEach((e) => console.error(`  ✖ ${e}`));
  process.exit(1);
} else {
  console.log(`\x1b[32m\n✨ All questions and exam configs validated successfully!\x1b[0m\n`);
  process.exit(0);
}
