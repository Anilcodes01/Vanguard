import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

type ProblemJson = {
  slug: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  minTime: number;
  maxTime: number;
  starterCode: string;
  languageId: number;
  testStrategy: 'DRIVER_CODE' | 'STDIN';
  driverCodeTemplate?: string | null;
  examples: Array<{ input?: string; output?: string; }>;
  testCases: Array<{ input?: string; expected?: string; description?: string; }>;
};

async function main() {
  console.log('Starting the seeding process...');

  try {
    const jsonPath = path.join(process.cwd(), 'problems.json');
    const fileContent = await fs.readFile(jsonPath, 'utf-8');
    const problemsData: ProblemJson[] = JSON.parse(fileContent);

    console.log(`Found ${problemsData.length} problems in problems.json`);

    for (const problem of problemsData) {
      console.log(`Seeding problem: ${problem.title}`);

      await prisma.problem.upsert({
        where: { slug: problem.slug },
        update: {
          title: problem.title,
          description: problem.description,
          difficulty: problem.difficulty,
          minTime: problem.minTime,
          maxTime: problem.maxTime,
          starterCode: problem.starterCode,
          languageId: problem.languageId,
          testStrategy: problem.testStrategy,
          driverCodeTemplate: problem.driverCodeTemplate,
          examples: {
            deleteMany: {},
            create: problem.examples,
          },
          testCases: {
            deleteMany: {},
            create: problem.testCases.map(tc => ({
              input: tc.input,
              expected: tc.expected,
              description: tc.description,
            })),
          },
        },
        create: {
          slug: problem.slug,
          title: problem.title,
          description: problem.description,
          difficulty: problem.difficulty,
          minTime: problem.minTime,
          maxTime: problem.maxTime,
          starterCode: problem.starterCode,
          languageId: problem.languageId,
          testStrategy: problem.testStrategy,
          driverCodeTemplate: problem.driverCodeTemplate,
          examples: {
            create: problem.examples,
          },
          testCases: {
            create: problem.testCases.map(tc => ({
              input: tc.input,
              expected: tc.expected,
              description: tc.description,
            })),
          },
        },
      });
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();