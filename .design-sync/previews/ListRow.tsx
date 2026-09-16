import { List, ListRow } from '@jt/ds';

export const Posts = () => (
  <div className="jt-root" style={{ padding: 16, width: 560 }}>
    <List>
      <ListRow date="May 12, 2026" title="On small models and small teams" description="A long argument that small teams should ship more, not less." href="#post-1" />
      <ListRow date="Apr 02, 2026" title='The case against the "command palette"' description="Command palettes are great until they replace the menu." href="#post-2" />
      <ListRow date="Nov 04, 2025" title="Designing for keyboards first" href="#post-3" />
    </List>
  </div>
);
