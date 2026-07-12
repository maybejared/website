import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MasterDetail, type RowProps } from './master-detail';

interface Item {
  slug: string;
}
const ITEMS: Item[] = [{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }];

function Row({ item, onClick }: RowProps<Item>) {
  return (
    <button type="button" onClick={onClick}>
      row-{item.slug}
    </button>
  );
}

function renderMasterDetail(overrides: Partial<Parameters<typeof MasterDetail<Item>>[0]> = {}) {
  const open = vi.fn();
  const close = vi.fn();
  render(
    <MasterDetail<Item>
      detailLabel="detail"
      listLabel="~/list"
      listCmd="ls"
      items={ITEMS}
      selected={0}
      open={open}
      opened={false}
      close={close}
      RowComponent={Row}
      renderDetail={(item) => <div>detail-{item.slug}</div>}
      {...overrides}
    />,
  );
  return { open, close };
}

describe('MasterDetail', () => {
  it('opens the clicked row by index', () => {
    const { open } = renderMasterDetail();
    fireEvent.click(screen.getByText('row-b'));
    expect(open).toHaveBeenCalledWith(1);
  });

  it('renders the detail for the selected index', () => {
    renderMasterDetail({ selected: 2 });
    expect(screen.getByText('detail-c')).toBeInTheDocument();
  });

  it('back control invokes close()', () => {
    const { close } = renderMasterDetail({ opened: true });
    fireEvent.click(screen.getByRole('button', { name: /cd \.\./i }));
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('hides the detail pane on mobile when closed, and the list pane when opened', () => {
    const { container, rerender } = render(
      <MasterDetail<Item>
        detailLabel="detail"
        listLabel="~/list"
        listCmd="ls"
        items={ITEMS}
        selected={0}
        open={vi.fn()}
        opened={false}
        close={vi.fn()}
        RowComponent={Row}
        renderDetail={(item) => <div>detail-{item.slug}</div>}
      />,
    );
    // Panes sit inside the split wrapper: first is detail, second is list.
    const [detailPane, listPane] = Array.from(
      container.querySelectorAll(':scope > div > div'),
    );
    expect(detailPane.className).toContain('max-md:hidden');
    expect(detailPane.className).toContain('md:flex-[2]');
    expect(listPane.className).not.toContain('max-md:hidden');
    expect(listPane.className).toContain('md:flex-[3]');

    rerender(
      <MasterDetail<Item>
        detailLabel="detail"
        listLabel="~/list"
        listCmd="ls"
        items={ITEMS}
        selected={0}
        open={vi.fn()}
        opened={true}
        close={vi.fn()}
        RowComponent={Row}
        renderDetail={(item) => <div>detail-{item.slug}</div>}
      />,
    );
    const [detailPane2, listPane2] = Array.from(
      container.querySelectorAll(':scope > div > div'),
    );
    expect(detailPane2.className).not.toContain('max-md:hidden');
    expect(detailPane2.className).toContain('md:flex-[3]');
    expect(listPane2.className).toContain('max-md:hidden');
    expect(listPane2.className).toContain('md:flex-[2]');
  });
});
