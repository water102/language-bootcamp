const exact = {
  display: {flex:'flex',grid:'grid',block:'block','inline-block':'inline-block','inline-flex':'inline-flex',none:'hidden',inline:'inline'},
  position: {relative:'relative',absolute:'absolute',fixed:'fixed',sticky:'sticky'},
  'flex-direction': {column:'flex-col',row:'flex-row'},
  'align-items': {center:'items-center','flex-start':'items-start','flex-end':'items-end',stretch:'items-stretch'},
  'align-self': {'flex-start':'self-start','flex-end':'self-end',center:'self-center'},
  'justify-content': {center:'justify-center','space-between':'justify-between','flex-start':'justify-start','flex-end':'justify-end'},
  'flex-wrap': {wrap:'flex-wrap',nowrap:'flex-nowrap'},
  'flex-shrink': {'0':'shrink-0','1':'shrink'},
  'font-weight': {'400':'font-normal','500':'font-medium','600':'font-semibold','700':'font-bold','800':'font-extrabold'},
  'font-family': {'var(--font-heading)':'font-display','var(--font-body)':'font-study','var(--font-mono)':'font-code'},
  'text-align': {left:'text-left',center:'text-center',right:'text-right'},
  'text-transform': {uppercase:'uppercase',lowercase:'lowercase'},
  'white-space': {nowrap:'whitespace-nowrap','pre-wrap':'whitespace-pre-wrap'},
  'text-overflow': {ellipsis:'text-ellipsis'},
  cursor: {pointer:'cursor-pointer','not-allowed':'cursor-not-allowed'},
  'pointer-events': {none:'pointer-events-none',auto:'pointer-events-auto'},
  'user-select': {none:'select-none'},
  'box-sizing': {'border-box':'box-border'},
  'list-style': {none:'list-none'},
  'text-decoration': {none:'no-underline','line-through':'line-through'},
  'font-style': {italic:'italic'},
};
const prefixes = {width:'w',height:'h','min-width':'min-w','max-width':'max-w','min-height':'min-h','max-height':'max-h',gap:'gap','row-gap':'gap-y','column-gap':'gap-x',padding:'p','padding-top':'pt','padding-right':'pr','padding-bottom':'pb','padding-left':'pl',margin:'m','margin-top':'mt','margin-right':'mr','margin-bottom':'mb','margin-left':'ml',top:'top',left:'left',right:'right',bottom:'bottom','border-radius':'rounded','font-size':'text','line-height':'leading','letter-spacing':'tracking','grid-template-columns':'grid-cols'};
const colors = {'--text-main':'main','--text-muted':'muted','--text-dim':'dim','--primary':'brand','--primary-light':'brand-light','--accent-cyan':'accent-cyan','--accent-rose':'accent-rose','--accent-green':'accent-green','--accent-amber':'accent-amber'};
const arbitrary = value => value.replaceAll(' ', '_');
export function utility(prop,value) {
  if (exact[prop]?.[value]) return exact[prop][value];
  if (prop.startsWith('overflow') && ['hidden','auto','scroll','visible'].includes(value)) return `${prop}-${value}`;
  if (prop === 'color') {
    const token = value.match(/^var\((--[^)]+)\)$/)?.[1];
    return colors[token] ? 'text-' + colors[token] : `text-[${arbitrary(value)}]`;
  }
  if (prop === 'z-index' && /^\d+$/.test(value)) return `z-${value}`;
  if (prop === 'opacity') return `opacity-[${value}]`;
  if (prop === 'flex') return `[flex:${arbitrary(value)}]`;
  if (['background','border','border-left','border-right','border-top','border-bottom','border-color'].includes(prop)) return `[${prop}:${arbitrary(value)}]`;
  if (prefixes[prop]) {
    const prefix = prefixes[prop];
    if (value === '0' || value === '0px') return prop === 'font-size' ? 'text-[0px]' : `${prefix}-0`;
    if (['width','height','min-width','max-width','min-height','max-height'].includes(prop) && value === '100%') return `${prefix}-full`;
    if (prop === 'min-height' && value === '100vh') return 'min-h-screen';
    if (/^(padding|margin)$/.test(prop) && value.includes(' ')) {
      const parts = value.split(/\s+/);
      if (parts.length === 2) return `${prefix}y-[${parts[0]}] ${prefix}x-[${parts[1]}]`;
      return null;
    }
    return `${prefix}-[${arbitrary(value)}]`;
  }
  return null;
}
