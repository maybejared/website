import { SectionHeader } from '@jt/ds';

export const WithAction = () => (
  <div className="jt-root" style={{ padding: 16 }}>
    <SectionHeader title="Featured projects" action={{ label: 'View all projects', href: '#work' }} />
  </div>
);

export const Plain = () => (
  <div className="jt-root" style={{ padding: 16 }}>
    <SectionHeader title="Writing / Notes / Experiments" />
  </div>
);
