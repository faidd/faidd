import { Agent, Rule } from '@faidd/types';

export function createAgent(name: string): Agent {
  return {
    id: Math.random().toString(36).substring(7),
    name,
    version: '0.1.1'
  };
}

export function validateRule(rule: Rule): boolean {
  return rule.description.length > 0;
}
