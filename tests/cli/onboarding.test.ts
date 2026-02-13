import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '../../tools/cli/src/services/config.service.js';
import fs from 'fs-extra';
import path from 'path';

vi.mock('fs-extra');

describe('Onboarding & Hierarchy Scaffolding', () => {
  let configService: ConfigService;

  beforeEach(() => {
    vi.clearAllMocks();
    configService = new ConfigService();
  });

  it('should verify if .faiddrc.json exists', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true as never);
    const exists = await configService.exists();
    expect(exists).toBe(true);
  });

  it('should scaffold the correct M0 hierarchy', async () => {
    const root = process.cwd();
    await configService.scaffoldHierarchy();

    // Verifying Saint des Saints (_faidd/)
    expect(fs.ensureDir).toHaveBeenCalledWith(path.join(root, '_faidd/rules'));
    expect(fs.ensureDir).toHaveBeenCalledWith(path.join(root, '_faidd/bin'));
    
    // Verifying Operational Brain (faidd/)
    expect(fs.ensureDir).toHaveBeenCalledWith(path.join(root, 'faidd/ledger'));
    expect(fs.ensureDir).toHaveBeenCalledWith(path.join(root, 'faidd/analysis'));
  });

  it('should save the governance law correctly', async () => {
    const mockConfig = {
      projectName: 'Test Project',
      developerName: 'Architect',
      environment: { ide: 'Zed', aiAssistant: 'Antigravity' },
      governance: { mode: 'sovereign', enforceReadOnly: true },
      metadata: { createdAt: 'now', version: '0.2.0' }
    };

    await configService.save(mockConfig as any);
    expect(fs.writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('.faiddrc.json'),
      mockConfig,
      { spaces: 2 }
    );
  });
});
