import { DitherImage } from '@jt/ds';

const SRC = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="#8fb3d9"/><polygon points="0,150 90,60 160,120 240,40 320,110 400,70 400,200 0,200" fill="#2f6b3a"/><polygon points="0,200 60,140 120,200" fill="#1c1c1a"/><polygon points="300,200 350,130 400,200" fill="#1c1c1a"/></svg>',
);

export const Dither = () => (
  <div className="jt-root" style={{ padding: 16, width: 320 }}>
    <DitherImage src={SRC} alt="Mountain lake" height={160} caption="IMG_0412" />
  </div>
);

export const Halftone = () => (
  <div className="jt-root" style={{ padding: 16, width: 320 }}>
    <DitherImage src={SRC} alt="Mountain lake" mode="halftone" height={160} />
  </div>
);

export const Color = () => (
  <div className="jt-root" style={{ padding: 16, width: 320 }}>
    <DitherImage src={SRC} alt="Mountain lake" mode="color" height={160} />
  </div>
);
