// xml.ts — XML handling utilities for agent compilation and content processing

// escape special chars for safe XML embedding
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// strip XML tags from content, returning plain text
export function stripXml(content: string): string {
  return content.replace(/<[^>]+>/g, '').trim();
}

// extract the text content of a specific XML tag
export function extractTag(content: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

// extract all occurrences of a tag
export function extractAllTags(content: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'gi');
  const results: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    results.push(match[1].trim());
  }
  return results;
}

// extract attribute value from an XML tag string
export function extractAttribute(tagStr: string, attr: string): string | null {
  const regex = new RegExp(`${attr}=["']([^"']+)["']`, 'i');
  const match = tagStr.match(regex);
  return match ? match[1] : null;
}

// wrap content in an XML tag with optional attributes
export function wrapTag(tag: string, content: string, attrs?: Record<string, string>): string {
  const attrStr = attrs
    ? ' ' + Object.entries(attrs).map(([k, v]) => `${k}="${escapeXml(v)}"`).join(' ')
    : '';
  return `<${tag}${attrStr}>\n${content}\n</${tag}>`;
}

// build an activation block (the core pattern used by B-Mad agents)
export function buildActivationBlock(
  agentPath: string,
  bunkerName: string = '_faidd'
): string {
  return [
    '<agent-activation CRITICAL="TRUE">',
    `1. LOAD the FULL agent file from @${bunkerName}/${agentPath}`,
    '2. READ its entire contents — persona, menu, and instructions.',
    '3. FOLLOW every step in the <activation> section precisely.',
    '4. DISPLAY the welcome/greeting.',
    '5. PRESENT the numbered menu and WAIT for user input.',
    '</agent-activation>',
  ].join('\n');
}

// convert simple XML-structured content to markdown
export function xmlToMarkdown(content: string): string {
  let md = content;

  // headers: <h1>...</h1> -> # ...
  md = md.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, text) => {
    return '#'.repeat(Number(level)) + ' ' + text.trim();
  });

  // bold
  md = md.replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, '**$2**');

  // italic
  md = md.replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, '*$2*');

  // code
  md = md.replace(/<code>([\s\S]*?)<\/code>/gi, '`$1`');

  // list items
  md = md.replace(/<li>([\s\S]*?)<\/li>/gi, '- $1');

  // strip remaining tags
  md = md.replace(/<[^>]+>/g, '');

  return md.trim();
}
