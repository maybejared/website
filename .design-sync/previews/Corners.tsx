import { Corners } from '@jt/ds';

export const Square = () => (
  <div className="jt-root" style={{ padding: 16 }}>
    <Corners>
      <div className="jt-graph" style={{ height: 120 }} />
    </Corners>
  </div>
);

export const Tall = () => (
  <div className="jt-root" style={{ padding: 16, width: 220 }}>
    <Corners variant="tall">
      <div style={{ height: 180, background: '#3d3d3a' }} />
    </Corners>
  </div>
);
