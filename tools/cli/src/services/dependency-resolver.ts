// dependency-resolver.ts — resolves cross-module dependencies
import fs from 'fs-extra';
import path from 'path';

export interface DependencyResult {
  // ordered list of modules to install (deps first)
  installOrder: string[];
  // map of module -> its direct dependencies
  graph: Map<string, string[]>;
  // any unresolvable deps
  missing: string[];
}

export interface FileReference {
  sourceModule: string;
  targetModule: string;
  path: string;
  type: 'load' | 'import' | 'command-ref';
}

export class DependencyResolver {
  // resolve install order for a set of modules, respecting their declared dependencies
  async resolve(
    moduleIds: string[],
    getDependencies: (moduleId: string) => Promise<string[]>
  ): Promise<DependencyResult> {
    const graph = new Map<string, string[]>();
    const visited = new Set<string>();
    const missing: string[] = [];

    // build the full dependency graph
    const buildGraph = async (moduleId: string) => {
      if (visited.has(moduleId)) return;
      visited.add(moduleId);

      const deps = await getDependencies(moduleId);
      graph.set(moduleId, deps);

      for (const dep of deps) {
        if (!moduleIds.includes(dep) && !visited.has(dep)) {
          // dependency is not in the requested install set
          // check if it actually exists
          const depDeps = await getDependencies(dep);
          if (depDeps.length >= 0) {
            await buildGraph(dep);
          } else {
            missing.push(dep);
          }
        } else {
          await buildGraph(dep);
        }
      }
    };

    for (const id of moduleIds) {
      await buildGraph(id);
    }

    // topological sort — deps come before dependents
    const installOrder = this.topologicalSort(graph);

    return { installOrder, graph, missing };
  }

  // scan files in a module for cross-module references (@load, @import directives)
  async scanFileReferences(
    bunkerDir: string,
    moduleId: string
  ): Promise<FileReference[]> {
    const refs: FileReference[] = [];
    const moduleDir = path.join(bunkerDir, moduleId);
    if (!(await fs.pathExists(moduleDir))) return refs;

    const files = await this.walkDir(moduleDir);

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!['.md', '.xml', '.yaml', '.yml'].includes(ext)) continue;

      const content = await fs.readFile(file, 'utf8');

      // @load directives: @load path/to/file
      const loadMatches = content.matchAll(/@load\s+([^\s\n]+)/g);
      for (const match of loadMatches) {
        const ref = this.parseModuleRef(match[1], moduleId);
        if (ref) refs.push(ref);
      }

      // explicit references to other modules: e.g. _faidd/other-module/agents/foo.md
      const pathMatches = content.matchAll(/_(?:faidd|bmad)\/([a-z][\w-]*)\//g);
      for (const match of pathMatches) {
        const targetModule = match[1];
        if (targetModule !== moduleId && targetModule !== 'core') {
          refs.push({
            sourceModule: moduleId,
            targetModule,
            path: match[0],
            type: 'command-ref',
          });
        }
      }
    }

    // deduplicate
    const seen = new Set<string>();
    return refs.filter(r => {
      const key = `${r.sourceModule}->${r.targetModule}:${r.path}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // -- private --

  private parseModuleRef(refPath: string, sourceModule: string): FileReference | null {
    // extract module name from path like bmm/agents/foo.md or _faidd/bmm/agents/foo.md
    const clean = refPath.replace(/^[.\/]*/, '').replace(/^_(?:faidd|bmad)\//, '');
    const segments = clean.split('/');
    if (segments.length < 2) return null;

    const targetModule = segments[0];
    if (targetModule === sourceModule) return null;

    return {
      sourceModule,
      targetModule,
      path: refPath,
      type: 'load',
    };
  }

  private topologicalSort(graph: Map<string, string[]>): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>(); // cycle detection

    const visit = (node: string) => {
      if (visited.has(node)) return;
      if (visiting.has(node)) return; // cycle — skip

      visiting.add(node);
      const deps = graph.get(node) ?? [];
      for (const dep of deps) {
        visit(dep);
      }
      visiting.delete(node);
      visited.add(node);
      sorted.push(node);
    };

    for (const node of graph.keys()) {
      visit(node);
    }

    return sorted;
  }

  private async walkDir(dir: string): Promise<string[]> {
    const results: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...await this.walkDir(full));
      } else {
        results.push(full);
      }
    }
    return results;
  }
}
