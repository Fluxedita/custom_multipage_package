import { CustomCodeSectionType } from './types';
import { v4 as uuid } from 'uuid';

export function createDefaultCustomCodeSection(): CustomCodeSectionType {
  return {
    id: uuid(),
    type: 'custom-code',
    code: `() => (
  <div style={{padding:20, color: '#333'}}>
    <p style={{textAlign: 'center'}}><b>This is a sample custom insert!</b></p>
  </div>
)`
  };
} 