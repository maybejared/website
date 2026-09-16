import { DataTable, Label } from '@jt/ds';

export const Projects = () => (
  <div className="jt-root" style={{ padding: 16, width: 640 }}>
    <DataTable
      columns={[
        { key: 'item', label: 'Item' },
        { key: 'project', label: 'Project' },
        { key: 'description', label: 'Description' },
        { key: 'tag', label: 'Tag' },
        { key: 'year', label: 'Year', align: 'right' },
      ]}
      rows={[
        { item: '01', project: <strong>signal/cli</strong>, description: "A terminal client for our team's IDE backend.", tag: <Label>[Tool]</Label>, year: '2026' },
        { item: '02', project: <strong>runlines</strong>, description: "A tiny todo-list that lives in your editor's status bar.", tag: <Label>[OSS]</Label>, year: '2026' },
        { item: '03', project: <strong>slowpost</strong>, description: 'A blogging tool that limits you to one post a week.', tag: <Label>[Product]</Label>, year: '2025' },
      ]}
    />
  </div>
);
