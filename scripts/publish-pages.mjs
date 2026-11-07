import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagesDir = path.join(root, 'pages');

function extractMarkdown(file) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const match = text.match(/`([\s\S]*?)`\s*\.trim\(\)/);
  return match ? match[1].trim() : '';
}

function markdownToHtml(markdown) {
  const lines = markdown.split('\n');
  const html = [];
  let list = false;
  for (const line of lines) {
    if (line.startsWith('- ')) {
      if (!list) {
        html.push('<ul>');
        list = true;
      }
      html.push(`<li>${line.slice(2)}</li>`);
      continue;
    }
    if (list) {
      html.push('</ul>');
      list = false;
    }
    if (line.startsWith('# ')) html.push(`<h1>${line.slice(2)}</h1>`);
    else if (line.startsWith('## ')) html.push(`<h2>${line.slice(3)}</h2>`);
    else if (line.trim()) html.push(`<p>${line}</p>`);
  }
  if (list) html.push('</ul>');
  return html.join('\n');
}

function page(title, body) {
  return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  body { margin: 0; font: 16px/1.5 ui-sans-serif, system-ui, sans-serif; background: #f8fafc; color: #0f172a; }
  main { max-width: 42rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
  a { color: #4338ca; }
  nav { display: flex; gap: 1rem; margin-bottom: 2rem; }
</style>
<main>
  <nav>
    <a href="/">Home</a>
    <a href="/privacy">Privacy</a>
    <a href="/terms">Terms</a>
    <a href="/support">Support</a>
  </nav>
  ${body}
</main>
`;
}

fs.mkdirSync(pagesDir, { recursive: true });
const privacy = markdownToHtml(extractMarkdown('content/privacy-policy.ts'));
const terms = markdownToHtml(extractMarkdown('content/terms-of-service.ts'));
fs.writeFileSync(path.join(pagesDir, 'index.html'), page('Create Filip App', '<h1>Create Filip App</h1><p>Privacy, terms, and support for this app.</p>'));
fs.writeFileSync(path.join(pagesDir, 'privacy.html'), page('Privacy', privacy));
fs.writeFileSync(path.join(pagesDir, 'terms.html'), page('Terms', terms));
fs.writeFileSync(
  path.join(pagesDir, 'support.html'),
  page('Support', '<h1>Support</h1><p>Replace this page with the support address listed on the store page.</p>'),
);
fs.writeFileSync(
  path.join(pagesDir, 'vercel.json'),
  JSON.stringify(
    {
      cleanUrls: true,
      rewrites: [
        { source: '/privacy', destination: '/privacy.html' },
        { source: '/terms', destination: '/terms.html' },
        { source: '/support', destination: '/support.html' },
      ],
    },
    null,
    2,
  ) + '\n',
);
console.log('Wrote helper pages to pages/');

if (!process.argv.includes('--deploy')) process.exit(0);

try {
  execSync('npx --yes vercel@latest whoami', { cwd: pagesDir, stdio: 'inherit' });
  execSync('npx --yes vercel@latest deploy --prod --yes', { cwd: pagesDir, stdio: 'inherit' });
} catch {
  console.log('Vercel is not logged in. Run `vercel login`, then `npm run pages:deploy`.');
  process.exit(1);
}
