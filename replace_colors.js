const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /\btext-navy-900\b/g, replacement: 'text-text-primary' },
  { regex: /\btext-slate-900\b/g, replacement: 'text-text-primary' },
  { regex: /\btext-gray-900\b/g, replacement: 'text-text-primary' },
  { regex: /\btext-slate-800\b/g, replacement: 'text-text-primary' },
  { regex: /\btext-gray-800\b/g, replacement: 'text-text-primary' },
  
  { regex: /\btext-slate-700\b/g, replacement: 'text-text-secondary' },
  { regex: /\btext-gray-700\b/g, replacement: 'text-text-secondary' },
  { regex: /\btext-slate-600\b/g, replacement: 'text-text-secondary' },
  { regex: /\btext-gray-600\b/g, replacement: 'text-text-secondary' },
  
  { regex: /\btext-slate-500\b/g, replacement: 'text-text-tertiary' },
  { regex: /\btext-gray-500\b/g, replacement: 'text-text-tertiary' },
  { regex: /\btext-slate-400\b/g, replacement: 'text-text-tertiary' },
  { regex: /\btext-gray-400\b/g, replacement: 'text-text-tertiary' },

  { regex: /\bhover:text-navy-900\b/g, replacement: 'hover:text-text-primary' },
  { regex: /\bhover:text-slate-900\b/g, replacement: 'hover:text-text-primary' },

  { regex: /\bbg-white\b/g, replacement: 'bg-surface-1' },
  { regex: /\bbg-slate-50\b/g, replacement: 'bg-surface-2' },
  { regex: /\bbg-gray-50\b/g, replacement: 'bg-surface-2' },
  { regex: /\bbg-slate-100\b/g, replacement: 'bg-surface-3' },
  { regex: /\bbg-gray-100\b/g, replacement: 'bg-surface-3' },

  { regex: /\bhover:bg-gray-50\b/g, replacement: 'hover:bg-surface-hover' },
  { regex: /\bhover:bg-slate-50\b/g, replacement: 'hover:bg-surface-hover' },
  { regex: /\bhover:bg-gray-100\b/g, replacement: 'hover:bg-surface-hover' },
  { regex: /\bhover:bg-slate-100\b/g, replacement: 'hover:bg-surface-hover' },

  { regex: /\bborder-gray-200\b/g, replacement: 'border-border-c' },
  { regex: /\bborder-slate-200\b/g, replacement: 'border-border-c' },
  { regex: /\bborder-gray-300\b/g, replacement: 'border-border-strong' },
  { regex: /\bborder-slate-300\b/g, replacement: 'border-border-strong' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Skip ReportViewPage since the user said: "DOCUMENT ITSELF SHOULD REMAIN LIGHT. Keep the report document canvas white with dark text intentionally."
  // Wait, I already added .report-content css in index.css. But let's check it manually later.
  
  for (const { regex, replacement } of replacements) {
    content = content.replace(regex, replacement);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated: ' + filePath);
  }
}

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      processFile(fullPath);
    }
  }
}

processDir(path.join(__dirname, 'frontend', 'src'));
