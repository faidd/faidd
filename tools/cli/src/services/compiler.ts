// compiler.ts — transforms .agent.yaml YAML into compiled .md (XML-in-markdown) format
import fs from 'fs-extra';
import path from 'path';
import YAML from 'yaml';
import { escapeXml } from './xml.js';

// -- types --

interface AgentMetadata {
  id?: string;
  name?: string;
  title?: string;
  icon?: string;
  [key: string]: unknown;
}

interface AgentPersona {
  role?: string;
  identity?: string;
  communication_style?: string;
  principles?: string | string[];
}

interface MenuItem {
  trigger?: string;
  description?: string;
  workflow?: string;
  exec?: string;
  tmpl?: string;
  data?: string;
  action?: string;
  multi?: string;
  triggers?: Record<string, unknown[]>[];
}

interface AgentPrompt {
  id?: string;
  content?: string;
}

interface AgentConfig {
  agent: {
    metadata: AgentMetadata;
    persona?: AgentPersona;
    menu?: MenuItem[];
    prompts?: AgentPrompt[];
    memories?: string[];
    critical_actions?: string[];
    install_config?: unknown;
    [key: string]: unknown;
  };
}

export interface CompileResult {
  xml: string;
  metadata: AgentMetadata;
}

// -- public API --

// compile a .agent.yaml file to .md
export async function compileAgentFile(
  yamlPath: string,
  outputPath?: string,
  answers: Record<string, unknown> = {}
): Promise<CompileResult & { outputPath: string }> {
  const content = await fs.readFile(yamlPath, 'utf8');
  const result = await compileAgent(content, answers, path.basename(yamlPath, '.agent.yaml'));

  // default output: same dir, .md extension
  const dest = outputPath ?? path.join(
    path.dirname(yamlPath),
    `${path.basename(yamlPath, '.agent.yaml')}.md`
  );

  await fs.ensureDir(path.dirname(dest));
  await fs.writeFile(dest, result.xml);

  return { ...result, outputPath: dest };
}

// compile raw YAML content to XML-in-markdown
export async function compileAgent(
  yamlContent: string,
  answers: Record<string, unknown> = {},
  agentName: string = ''
): Promise<CompileResult> {
  const config = YAML.parse(yamlContent) as AgentConfig;
  const agent = config.agent;
  const meta = agent.metadata;

  // apply template answers as placeholder replacements
  let finalYaml = yamlContent;
  for (const [key, value] of Object.entries(answers)) {
    finalYaml = finalYaml.replaceAll(`{{${key}}}`, String(value));
  }

  // re-parse after replacements
  const processed = YAML.parse(finalYaml) as AgentConfig;
  const processedAgent = processed.agent;

  // build the compiled output
  let xml = '';

  // frontmatter
  xml += buildFrontmatter(meta, agentName || meta.name || 'agent');

  // open XML code fence
  xml += '```xml\n';

  // agent tag
  const attrs = [
    `id="${meta.id || ''}"`,
    `name="${meta.name || ''}"`,
    `title="${meta.title || ''}"`,
    `icon="${meta.icon || '🤖'}"`,
  ];
  xml += `<agent ${attrs.join(' ')}>\n`;

  // activation block
  xml += buildActivation(meta);

  // persona
  xml += buildPersonaXml(processedAgent.persona);

  // prompts
  if (processedAgent.prompts?.length) {
    xml += buildPromptsXml(processedAgent.prompts);
  }

  // memories
  if (processedAgent.memories?.length) {
    xml += buildMemoriesXml(processedAgent.memories);
  }

  // menu
  xml += buildMenuXml(processedAgent.menu ?? []);

  // close
  xml += '</agent>\n';
  xml += '```\n';

  return { xml, metadata: meta };
}

// -- builders --

function buildFrontmatter(meta: AgentMetadata, agentName: string): string {
  const name = agentName.replaceAll('-', ' ');
  const desc = meta.title || 'FAIDD Agent';

  return [
    '---',
    `name: "${name}"`,
    `description: "${desc}"`,
    '---',
    '',
    'You must fully embody this agent\'s persona and follow all activation instructions exactly as specified. NEVER break character until given an exit command.',
    '',
    '',
  ].join('\n');
}

function buildActivation(meta: AgentMetadata): string {
  return [
    '  <activation>',
    '    <steps>',
    '      <step>READ the entire agent file.</step>',
    '      <step>ADOPT the persona described.</step>',
    '      <step>DISPLAY the welcome greeting.</step>',
    '      <step>PRESENT the numbered menu and WAIT for user input.</step>',
    '    </steps>',
    '  </activation>',
    '',
  ].join('\n');
}

function buildPersonaXml(persona?: AgentPersona): string {
  if (!persona) return '';

  let xml = '  <persona>\n';

  if (persona.role) {
    xml += `    <role>${escapeXml(normalize(persona.role))}</role>\n`;
  }
  if (persona.identity) {
    xml += `    <identity>${escapeXml(normalize(persona.identity))}</identity>\n`;
  }
  if (persona.communication_style) {
    xml += `    <communication_style>${escapeXml(normalize(persona.communication_style))}</communication_style>\n`;
  }
  if (persona.principles) {
    const text = Array.isArray(persona.principles)
      ? persona.principles.join(' ')
      : normalize(persona.principles);
    xml += `    <principles>${escapeXml(text)}</principles>\n`;
  }

  xml += '  </persona>\n';
  return xml;
}

function buildPromptsXml(prompts: AgentPrompt[]): string {
  let xml = '  <prompts>\n';
  for (const p of prompts) {
    xml += `    <prompt id="${p.id || ''}">\n`;
    xml += `      <content>\n${p.content || ''}\n      </content>\n`;
    xml += `    </prompt>\n`;
  }
  xml += '  </prompts>\n';
  return xml;
}

function buildMemoriesXml(memories: string[]): string {
  let xml = '  <memories>\n';
  for (const m of memories) {
    xml += `    <memory>${escapeXml(String(m))}</memory>\n`;
  }
  xml += '  </memories>\n';
  return xml;
}

function buildMenuXml(items: MenuItem[]): string {
  let xml = '  <menu>\n';

  // standard items injected at the top
  xml += `    <item cmd="MH or fuzzy match on menu or help">[MH] Redisplay Menu Help</item>\n`;
  xml += `    <item cmd="CH or fuzzy match on chat">[CH] Chat with the Agent about anything</item>\n`;

  // user-defined items
  for (const item of items) {
    if (item.multi && item.triggers) {
      // multi-trigger item with nested handlers
      xml += `    <item type="multi">${escapeXml(item.multi)}\n`;
      xml += buildNestedHandlers(item.triggers);
      xml += `    </item>\n`;
    } else if (item.trigger) {
      // standard single-trigger item
      const attrs = [`cmd="${item.trigger}"`];
      if (item.workflow) attrs.push(`workflow="${item.workflow}"`);
      if (item.exec) attrs.push(`exec="${item.exec}"`);
      if (item.tmpl) attrs.push(`tmpl="${item.tmpl}"`);
      if (item.data) attrs.push(`data="${item.data}"`);
      if (item.action) attrs.push(`action="${item.action}"`);
      xml += `    <item ${attrs.join(' ')}>${escapeXml(item.description || '')}</item>\n`;
    }
  }

  // standard items at the bottom
  xml += `    <item cmd="DA or fuzzy match on exit, leave, goodbye or dismiss agent">[DA] Dismiss Agent</item>\n`;
  xml += '  </menu>\n';
  return xml;
}

function buildNestedHandlers(triggers: Record<string, unknown[]>[]): string {
  let xml = '';
  for (const group of triggers) {
    for (const [name, execArray] of Object.entries(group)) {
      const trigger = name.startsWith('*') ? name : `*${name}`;
      const data = processExecArray(execArray as Record<string, unknown>[]);

      const attrs = [`match="${escapeXml(data.description)}"`];
      if (data.route) attrs.push(`exec="${data.route}"`);
      if (data.workflow) attrs.push(`workflow="${data.workflow}"`);
      if (data.action) attrs.push(`action="${data.action}"`);
      if (data.data) attrs.push(`data="${data.data}"`);

      xml += `      <handler ${attrs.join(' ')}></handler>\n`;
    }
  }
  return xml;
}

function processExecArray(execArray: Record<string, unknown>[]): {
  description: string;
  route: string | null;
  workflow: string | null;
  data: string | null;
  action: string | null;
} {
  const result = { description: '', route: null as string | null, workflow: null as string | null, data: null as string | null, action: null as string | null };
  if (!Array.isArray(execArray)) return result;

  for (const exec of execArray) {
    if (exec.input) result.description = String(exec.input);
    if (exec.route) {
      const route = String(exec.route);
      if (route.endsWith('.yaml') || route.endsWith('.yml')) {
        result.workflow = route;
      } else {
        result.route = route;
      }
    }
    if (exec.data != null) result.data = String(exec.data);
    if (exec.action) result.action = String(exec.action);
  }

  return result;
}

// -- utils --

// collapse whitespace/newlines into a single line
function normalize(text: string): string {
  return text.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ');
}

// filter out empty/null values from customization data
export function filterCustomizationData(data: Record<string, unknown>): Record<string, unknown> {
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length > 0) filtered[key] = value;
    } else if (typeof value === 'object') {
      const nested = filterCustomizationData(value as Record<string, unknown>);
      if (Object.keys(nested).length > 0) filtered[key] = nested;
    } else {
      filtered[key] = value;
    }
  }
  return filtered;
}
