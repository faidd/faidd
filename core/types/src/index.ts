export interface Agent {
  id: string;
  name: string;
  version: string;
}

export type RuleSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Rule {
  id: string;
  description: string;
  severity: RuleSeverity;
}
