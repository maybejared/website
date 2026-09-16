import { ArrowLink } from '@jt/ds';

export const Default = () => (
  <div className="jt-root" style={{ padding: 16, display: 'flex', gap: 24 }}>
    <ArrowLink href="#projects">View all projects</ArrowLink>
    <ArrowLink href="#writing">View all</ArrowLink>
  </div>
);
