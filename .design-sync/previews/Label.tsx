import { Label } from '@jt/ds';

export const Tones = () => (
  <div className="jt-root" style={{ padding: 16, display: 'flex', gap: 24, alignItems: 'center' }}>
    <Label>01 / Work</Label>
    <Label tone="ink">Field notes</Label>
    <Label tone="accent">[02] Writing</Label>
    <Label>May 12, 2026</Label>
    <Label>37.8136° S</Label>
  </div>
);

export const Vertical = () => (
  <div className="jt-root" style={{ padding: 16, height: 120 }}>
    <Label vertical>2026</Label>
  </div>
);
