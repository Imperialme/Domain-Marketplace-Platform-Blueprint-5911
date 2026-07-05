import { DynadotRegistrar } from './dynadot.js';
import { GoDaddyRegistrar } from './godaddy.js';

export function createRegistrar(cfg) {
  switch (cfg.registrar) {
    case 'dynadot':
      return new DynadotRegistrar(cfg.dynadot);
    case 'godaddy':
      return new GoDaddyRegistrar(cfg.godaddy);
    default:
      throw new Error(`Unknown registrar "${cfg.registrar}" (supported: dynadot, godaddy)`);
  }
}
