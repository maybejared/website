import { List, ListRow } from '@jt/ds';

export const Default = () => (
  <div className="jt-root" style={{ padding: 16, width: 520 }}>
    <List>
      <ListRow date="2026" title="signal/cli" description="A terminal client for our team's IDE backend." href="#signal" />
      <ListRow date="2026" title="runlines" description="A tiny todo-list that lives in your editor's status bar." href="#runlines" />
    </List>
  </div>
);
