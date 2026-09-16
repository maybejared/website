import { Crosshair } from '@jt/ds';

export const Default = () => (
  <div className="jt-root jt-graph" style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
    <Crosshair />
  </div>
);

export const Small = () => (
  <div className="jt-root" style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
    <Crosshair size={40} />
  </div>
);
