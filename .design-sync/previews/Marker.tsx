import { Marker } from '@jt/ds';

export const Steps = () => (
  <div className="jt-root" style={{ padding: 16, display: 'flex', gap: 6, alignItems: 'center' }}>
    <Marker />
    <Marker tone="rule" />
    <Marker tone="rule" />
    <Marker tone="rule" />
    <Marker tone="ink" />
  </div>
);
