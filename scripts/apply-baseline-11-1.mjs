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

function replaceRequired(
  source,
  search,
  replacement,
  label,
) {
  if (!source.includes(search)) {
    throw new Error(
      `Không tìm thấy điểm sửa: ${label}`,
    );
  }

  return source.replace(search, replacement);
}

const changes = [];

function stage(relativePath, updated) {
  const original = read(relativePath);

  if (updated !== original) {
    changes.push({
      relativePath,
      updated,
    });
  }
}

try {
  // Backend Customer Portal
  {
    const file =
      'apps/api/src/modules/customer-portal/customer-portal.service.ts';
    let source = read(file);

    source = replaceRequired(
      source,
      `          status: 'APPROVED',
          approvedAt: new Date(),`,
      `          quoteStatus: 'ACCEPTED',
          acceptedAt: new Date(),
          acceptedByUserId: input.customerUserId,`,
      'pricing quote approval fields',
    );

    source = replaceRequired(
      source,
      `          agreedPrice: quote.customerPrice,`,
      `          agreedPrice: quote.customerTotal,`,
      'quote customer total',
    );

    stage(file, source);
  }

  // Customer Web types
  {
    const file =
      'apps/customer-web/src/types/customer.ts';
    let source = read(file);

    source = replaceRequired(
      source,
      `    status: string;
    customerPrice: number;`,
      `    quoteStatus: string;
    customerTotal: number;`,
      'customer quote type',
    );

    stage(file, source);
  }

  // Customer Web Job Detail
  {
    const file =
      'apps/customer-web/src/pages/JobDetailPage.tsx';
    let source = read(file);

    source = replaceRequired(
      source,
      `                    {quote.customerPrice.toLocaleString(`,
      `                    {quote.customerTotal.toLocaleString(`,
      'quote total display',
    );

    source = source.replace(
      `<StatusBadge status={quote.status} />`,
      `<StatusBadge status={quote.quoteStatus} />`,
    );

    source = source.replace(
      `quote.status !== 'APPROVED'`,
      `quote.quoteStatus !== 'ACCEPTED'`,
    );

    stage(file, source);
  }

  // Checklist
  {
    const file =
      'WORKLINK_IMPLEMENTATION_CHECKLIST.md';
    const source = read(file);
    const section = `
## Baseline 11.1 — Pricing Quote Field Fix

- [x] Đồng bộ pricingQuotes.quoteStatus.
- [x] Đồng bộ pricingQuotes.customerTotal.
- [x] Dùng acceptedAt thay approvedAt.
- [x] Lưu acceptedByUserId.
- [x] Customer Web hiển thị quoteStatus.
- [x] Customer Web hiển thị customerTotal.
- [ ] Chạy lại API typecheck.
- [ ] Chạy lại Customer Web typecheck.
`;

    stage(
      file,
      source.includes(
        '## Baseline 11.1 — Pricing Quote Field Fix',
      )
        ? source
        : `${source.trimEnd()}\n\n${section.trim()}\n`,
    );
  }

  for (const change of changes) {
    write(change.relativePath, change.updated);
  }

  console.log(
    `Baseline 11.1 applied successfully: ${changes.length} files updated.`,
  );
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message
      : error,
  );
  process.exit(1);
}
