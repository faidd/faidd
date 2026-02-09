export const AgentSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    version: { type: 'string' }
  },
  required: ['id', 'name', 'version']
};
