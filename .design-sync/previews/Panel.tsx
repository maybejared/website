import { KeyValue, Label, Panel } from '@jt/ds';

export const Basecamp = () => (
  <div className="jt-root" style={{ padding: 16, width: 360 }}>
    <Panel
      title="Basecamp"
      index="01"
      footer={<Label>Build / Explore / Iterate / Repeat</Label>}
    >
      <KeyValue
        rows={[
          { key: 'Location', value: 'Melbourne, AU · UTC+10' },
          { key: 'Focus', value: 'Systems Architecture\nAI Augmented Engineering' },
          { key: 'Status', value: 'Building at Lyra + Cranium', live: true },
          { key: 'Contact', value: <strong>jared@rmr.studio</strong> },
        ]}
      />
    </Panel>
  </div>
);

export const InkBorder = () => (
  <div className="jt-root" style={{ padding: 16, width: 360 }}>
    <Panel title="Field notes" ink>
      <p className="jt-body" style={{ whiteSpace: 'pre-line' }}>{'Better tools.\nKinder systems.\nA more beautiful internet.'}</p>
    </Panel>
  </div>
);
