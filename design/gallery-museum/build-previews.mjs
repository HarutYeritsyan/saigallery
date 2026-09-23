// Renders each .dc.html artboard to a standalone HTML file in preview/, resolving the canvas
// template holes ({{wall}}, {{velvet}}, <sc-for> lists) with their default values.
// Usage: node design/gallery-museum/build-previews.mjs
import fs from 'node:fs';

const dir = new URL('.', import.meta.url).pathname;
const out = dir + 'preview/';
fs.mkdirSync(out, { recursive: true });

const unescape = (s) => s.replaceAll('&quot;', '"').replaceAll('&amp;', '&').replaceAll('&#39;', "'");

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.dc.html'))) {
  const src = fs.readFileSync(dir + file, 'utf8');
  const title = src.match(/<title>([^<]*)<\/title>/)[1];
  const helmet = src.match(/<helmet>([\s\S]*?)<\/helmet>/)[1];
  let body = src.match(/<x-dc>([\s\S]*?)<\/x-dc>/)[1].replace(/<helmet>[\s\S]*?<\/helmet>/, '');
  const script = src.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];
  const propsJson = src.match(/data-props=(?:'([^']*)'|"([^"]*)")/);
  const props = JSON.parse(unescape(propsJson[1] ?? propsJson[2]));

  const ITEMS = new Function(`${script.match(/const ITEMS = [\s\S]*?\}\)\);/)[0]}; return ITEMS;`)();
  const lists = { rowA: ITEMS.slice(0, 4), rowB: ITEMS.slice(4, 8), rowC: ITEMS.slice(0, 2) };

  body = body.replace(/<sc-for list="\{\{(\w+)\}\}"[^>]*>([\s\S]*?)<\/sc-for>/g, (_, name, tpl) =>
    lists[name].map((item) => tpl.replace(/\{\{item\.(\w+)\}\}/g, (_, k) => item[k])).join('\n'));
  body = body.replace(/\{\{(\w+)\}\}/g, (_, k) => props[k].default);
  if (body.includes('{{')) throw new Error(`${file}: unresolved template hole`);

  // Prototype links between artboards point at the rendered previews.
  body = body.replace(/href="(\w+)\.dc\.html"/g, 'href="$1.html"');
  fs.writeFileSync(out + file.replace('.dc.html', '.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
${helmet.trim()}
</head>
<body>
${body.trim()}
</body>
</html>
`);
}
