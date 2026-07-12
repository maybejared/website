export interface AsciiCell {
  ch: string;
  /** null → uncoloured (render with the scheme's default fg). */
  rgb: [number, number, number] | null;
}

export interface AsciiArt {
  cols: number;
  rows: number;
  cells: AsciiCell[][];
}

const ESC = "";

const rowEmpty = (row: AsciiCell[]): boolean =>
  row.every((c) => c.ch === " ");

/**
 * Parse truecolour SGR ANSI art into a cell grid. Understands exactly the
 * grammar the exporter emits — `ESC[38;2;R;G;Bm` sets the foreground,
 * `ESC[0m` (or `ESC[m`) resets — and skips any other SGR sequence, so
 * exports from other tools degrade gracefully instead of erroring.
 */
export function parseAnsi(text: string): AsciiArt {
  const cells: AsciiCell[][] = [];
  let rgb: [number, number, number] | null = null;

  for (const line of text.split(/\r?\n/)) {
    const row: AsciiCell[] = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === ESC && line[i + 1] === "[") {
        const end = line.indexOf("m", i + 2);
        if (end === -1) break; // malformed tail — drop the rest of the line
        const body = line.slice(i + 2, end);
        const params = body.split(";").map(Number);
        if (params[0] === 38 && params[1] === 2 && params.length >= 5) {
          rgb = [params[2] || 0, params[3] || 0, params[4] || 0];
        } else if (body === "" || params[0] === 0) {
          rgb = null;
        }
        i = end + 1;
      } else {
        // Spaces are empty cells; colour only travels with visible glyphs.
        row.push({ ch: line[i], rgb: line[i] === " " ? null : rgb });
        i += 1;
      }
    }
    cells.push(row);
  }

  // Exporters pad the art vertically; trim so the canvas aspect matches the
  // visible glyphs.
  while (cells.length && rowEmpty(cells[0])) cells.shift();
  while (cells.length && rowEmpty(cells[cells.length - 1])) cells.pop();

  const cols = cells.reduce((m, r) => Math.max(m, r.length), 0);
  return { cols, rows: cells.length, cells };
}
