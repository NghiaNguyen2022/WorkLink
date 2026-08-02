import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function full(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(full(relativePath), 'utf8');
}

function write(relativePath, content) {
  fs.writeFileSync(full(relativePath), content, 'utf8');
}

const changes = [];

function stage(relativePath, updated) {
  const original = read(relativePath);

  if (original !== updated) {
    changes.push({ relativePath, updated });
  }
}

try {
  // 1. Export training schema.
  {
    const file = 'apps/api/src/database/schema/index.ts';
    const source = read(file);

    const updated = source.includes(
      "export * from './training';",
    )
      ? source
      : `${source.trimEnd()}\nexport * from './training';\n`;

    stage(file, updated);
  }

  // 2. Remove direct dependency on Express Response type.
  {
    const file =
      'apps/api/src/modules/reporting/reporting.controller.ts';
    let source = read(file);

    source = source.replace(
      "import type { Response } from 'express';\n\n",
      '',
    );

    source = source.replace(
      '@Res() response: Response,',
      `@Res()
    response: {
      setHeader(name: string, value: string): void;
      send(body: string): void;
    },`,
    );

    stage(file, source);
  }

  // 3. Append checklist status.
  {
    const file = 'WORKLINK_IMPLEMENTATION_CHECKLIST.md';
    const source = read(file);

    const section = `
## Baseline 10.2 — Training Schema Export Fix

- [x] Export schema training trong database/schema/index.ts.
- [x] Khôi phục các export workerCertificates và workerBadges.
- [x] Khôi phục export trainingCourses, enrollments, assessments.
- [x] ReportingController không phụ thuộc @types/express.
- [ ] Chạy lại API typecheck.
- [ ] Chạy lại API build.
`;

    const updated = source.includes(
      '## Baseline 10.2 — Training Schema Export Fix',
    )
      ? source
      : `${source.trimEnd()}\n\n${section.trim()}\n`;

    stage(file, updated);
  }

  for (const change of changes) {
    write(change.relativePath, change.updated);
  }

  console.log(
    `Baseline 10.2 applied successfully: ${changes.length} files updated.`,
  );
} catch (error) {
  console.error(
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
}
