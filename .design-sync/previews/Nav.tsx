import { Nav } from '@jt/ds';

export const Default = () => (
  <div className="jt-root">
    <Nav
      brand="JT"
      tagline="Systems × Code × Field"
      items={[
        { index: '01', label: 'Home', href: '#', active: true },
        { index: '02', label: 'Work', href: '#work' },
        { index: '03', label: 'Writing', href: '#writing' },
        { index: '04', label: 'About', href: '#about' },
      ]}
      cta={{ label: "[●] Let's talk", href: 'mailto:jared@rmr.studio' }}
    />
  </div>
);

export const Minimal = () => (
  <div className="jt-root">
    <Nav
      brand="JT"
      items={[
        { index: '01', label: 'Work', href: '#work', active: true },
        { index: '02', label: 'Writing', href: '#writing' },
      ]}
    />
  </div>
);
