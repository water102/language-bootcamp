// One-time cleanup of static inline styles, including HTML templates in the tool runtime.
import fs from 'node:fs';
import { utility } from './lib/css-utilities.mjs';
let count = 0;
const paths = [...fs.readdirSync('src/pages').map(f => 'src/pages/' + f), 'src/components/StudyLayout.jsx'];
for (const path of paths) {
  const source = fs.readFileSync(path,'utf8').replace(/<[^<>]*?style=\{\{[^{}]*\}\}[^<>]*>/g, tag => {
    const match = tag.match(/style=\{(\{[^{}]*\})\}/);
    const styles = JSON.parse(match[1]), rest = {}, classes = [];
    for (const [key,value] of Object.entries(styles)) {
      const candidate = utility(key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),value);
      if (candidate) classes.push(candidate); else rest[key] = value;
    }
    if (!classes.length) return tag;
    count++;
    tag = tag.replace(match[0],Object.keys(rest).length ? `style={${JSON.stringify(rest)}}` : '');
    if (/className="[^"]*"/.test(tag)) return tag.replace(/className="([^"]*)"/,(_,c)=>`className="${c} ${classes.join(' ')}"`);
    return tag.replace(/^<(\w+)/,`<$1 className="${classes.join(' ')}"`);
  });
  fs.writeFileSync(path,source);
}
const path = 'src/runtime/controller.js';
const source = fs.readFileSync(path,'utf8').replace(/<[^<>]*?style="[^"]*"[^<>]*>/g, tag => {
  const match = tag.match(/style="([^"]*)"/);
  if (match[1].includes('${')) return tag;
  const classes = [], rest = [];
  for (const entry of match[1].split(';').filter(Boolean)) {
    const i = entry.indexOf(':'), key = entry.slice(0,i).trim(), value = entry.slice(i+1).trim();
    const candidate = utility(key,value);
    if (candidate) classes.push(candidate); else rest.push(entry);
  }
  if (!classes.length) return tag;
  count++;
  tag = tag.replace(match[0],rest.length ? `style="${rest.join(';')}"` : '');
  if (/class="[^"]*"/.test(tag)) return tag.replace(/class="([^"]*)"/,(_,c)=>`class="${c} ${classes.join(' ')}"`);
  return tag.replace(/^<(\w+)/,`<$1 class="${classes.join(' ')}"`);
});
fs.writeFileSync(path,source);
console.log(`Converted ${count} remaining static inline style blocks.`);
