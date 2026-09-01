import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

async function textOfPage(page) { const content = await page.getTextContent(); return content.items.map((item) => 'str' in item ? item.str : '').join(' '); }
for (const mode of ['student', 'teacher']) {
  const dir = path.join(process.cwd(), 'outputs', 'pdf', mode);
  const files = (await readdir(dir)).filter((file) => file.endsWith('.pdf')).sort();
  if (files.length !== 5) throw new Error(`${mode}: expected 5 PDFs, got ${files.length}`);
  for (const file of files) {
    const bytes = new Uint8Array(await readFile(path.join(dir, file)));
    const document = await getDocument({ data: bytes, useWorkerFetch: false, isEvalSupported: false }).promise;
    if (document.numPages !== 25) throw new Error(`${file}: expected 25 pages, got ${document.numPages}`);
    const pageTexts = [];
    for (let number = 1; number <= document.numPages; number += 1) pageTexts.push(await textOfPage(await document.getPage(number)));
    if (pageTexts.some((text) => text.replace(/\s/g, '').length < 30)) throw new Error(`${file}: blank or near-blank page detected`);
    const all = pageTexts.join('\n');
    const compact = all.replace(/\s/g, '');
    if (mode === 'student' && /Ответ:|Комментарийпреподавателю:/.test(compact)) throw new Error(`${file}: student PDF exposes teacher content`);
    if (mode === 'teacher' && (!compact.includes('Ответ:') || !compact.includes('Комментарийпреподавателю:'))) throw new Error(`${file}: teacher PDF lacks answers or comments`);
    if (!/Готово:/.test((pageTexts.at(-1) ?? '').replace(/\s/g, ''))) throw new Error(`${file}: final page is missing or clipped`);
    console.log(`OK ${mode}/${file}: 25 non-empty pages`);
  }
}
