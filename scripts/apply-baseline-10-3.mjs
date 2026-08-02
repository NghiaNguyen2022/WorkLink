import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(
  root,
  'apps/operations-web/src/pages/DashboardPage.tsx',
);

const source = fs.readFileSync(file, 'utf8');

if (!source.includes('BanknoteArrowDown')) {
  console.log(
    'Baseline 10.3: BanknoteArrowDown không còn tồn tại, không cần sửa.',
  );
  process.exit(0);
}

const updated = source
  .replace('  BanknoteArrowDown,', '  Banknote,')
  .replace('icon={BanknoteArrowDown}', 'icon={Banknote}');

fs.writeFileSync(file, updated, 'utf8');

console.log(
  'Baseline 10.3 applied successfully: replaced BanknoteArrowDown with Banknote.',
);
