import { KeyValue } from '@jt/ds';

export const Default = () => (
  <div className="jt-root" style={{ padding: 16, width: 320 }}>
    <KeyValue
      rows={[
        { key: 'Location', value: 'Melbourne, AU · UTC+10' },
        { key: 'Stack', value: 'Distributed Systems\nRust · TypeScript · Next.js' },
        { key: 'Status', value: 'Open to opportunities', live: true },
        { key: 'Contact', value: <strong>jared@rmr.studio</strong> },
      ]}
    />
  </div>
);
