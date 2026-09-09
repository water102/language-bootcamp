// One-time CSS migration. Do not rerun after editing the migrated styles.
import fs from 'node:fs';
import postcss from 'postcss';

import { utility } from './lib/css-utilities.mjs';

let css = fs.readFileSync('src/style.css','utf8');
const root = postcss.parse(css);
const tokens = root.nodes.find(node => node.selector === ':root');
fs.writeFileSync('src/tokens.css', '/* Original design tokens; shared by Tailwind utilities and component effects. */\n' + tokens.toString() + '\n');
tokens.remove();
root.walkAtRules('import', rule => rule.remove());
const base = [];
root.walkRules(rule => {
  if (['*, *::before, *::after'].includes(rule.selector)) {rule.remove(); return;}
  if (['html, body','a','a:hover','button, input, select, textarea'].includes(rule.selector)) {base.push(rule.toString()); rule.remove();}
});
fs.writeFileSync('src/base.css', '/* Brand base styles after Tailwind Preflight. */\n' + base.join('\n\n') + '\n');
let declarations = 0, rules = 0;
root.walkRules(rule => {
  if (rule.parent.type === 'atrule' && rule.parent.name.includes('keyframes')) return;
  let converted = false;
  for (const node of [...rule.nodes]) {
    if (node.type !== 'decl' || node.important) continue;
    const candidate = utility(node.prop,node.value);
    if (!candidate) continue;
    const prev = node.prev();
    if (prev?.type === 'atrule' && prev.name === 'apply') prev.params += ' ' + candidate;
    else node.before(postcss.atRule({name:'apply',params:candidate}));
    node.remove(); declarations++; converted = true;
  }
  if (converted) rules++;
});
// This selector originally depended on inline styles; use a stable semantic hook instead.
root.walkRules(rule => { rule.selector = rule.selector.replace('#view-pronunciation > div[style*="grid"]', '#view-pronunciation > .pronunciation-reference-grid'); });
fs.writeFileSync('src/style.css', root.toString());

let inlineCount = 0, propsCount = 0;
for (const file of [...fs.readdirSync('src/pages').map(f=>'src/pages/'+f),'src/components/StudyLayout.jsx']) {
  let source = fs.readFileSync(file,'utf8');
  source = source.replace(/<[^<>]*?style=\{\{[^{}]*\}\}[^<>]*>/g, tag => {
    const match = tag.match(/style=\{(\{[^{}]*\})\}/);
    if (!match) return tag;
    const styles = JSON.parse(match[1]);
    const classes = [], rest = {};
    for (const [key,value] of Object.entries(styles)) {
      const prop = key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
      // Keep properties the runtime changes via element.style; utility precedence must not interfere.
      const candidate = utility(prop,value);
      if (candidate) {classes.push(candidate); propsCount++;} else rest[key] = value;
    }
    if (!classes.length) return tag;
    inlineCount++;
    if (file.endsWith('PronunciationPage.jsx') && styles.display === 'grid') classes.unshift('pronunciation-reference-grid');
    tag = tag.replace(match[0], Object.keys(rest).length ? `style={${JSON.stringify(rest)}}` : '');
    if (/className="[^"]*"/.test(tag)) tag = tag.replace(/className="([^"]*)"/,(_,c)=>`className="${c} ${classes.join(' ')}"`);
    else tag = tag.replace(/^<(\w+)/,`<$1 className="${classes.join(' ')}"`);
    return tag;
  });
  fs.writeFileSync(file,source);
}
console.log(JSON.stringify({declarations,rules,inlineCount,propsCount}));
