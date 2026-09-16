import { Button } from '@jt/ds';

export const Variants = () => (
  <div className="jt-root" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
    <Button variant="fill" keyHint="S">Start a project</Button>
    <Button keyHint="D">Documentation</Button>
    <Button variant="accent">Let's talk ↗</Button>
    <Button disabled>Disabled</Button>
  </div>
);

export const AsLink = () => (
  <div className="jt-root" style={{ padding: 16 }}>
    <Button href="#work" variant="fill">View all work</Button>
  </div>
);
