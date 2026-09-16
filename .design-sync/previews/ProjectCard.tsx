import { ProjectCard } from '@jt/ds';

export const Grid = () => (
  <div className="jt-root" style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, width: 560 }}>
    <ProjectCard
      index="01"
      year="2026"
      title="signal/cli"
      tags={['Tool', 'Rust + Tauri']}
      description="A terminal client for our team's IDE backend. Written in Rust + Tauri."
      href="#signal"
      media={<div style={{ height: '100%', background: '#141412' }} />}
    />
    <ProjectCard
      index="02"
      year="2026"
      title="Cranium"
      tags={['Architecture', 'Open source']}
      description="The alignment substrate for AI-augmented engineering teams."
      href="#cranium"
      media={<div className="jt-graph" style={{ height: '100%' }} />}
    />
  </div>
);
