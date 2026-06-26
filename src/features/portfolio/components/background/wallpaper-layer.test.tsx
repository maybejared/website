import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WallpaperLayer } from './wallpaper-layer';

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_CDN_URL', 'https://cdn.jtucker.io');
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe('WallpaperLayer', () => {
  it('renders the wallpaper image when enabled with a known id', () => {
    const { container } = render(<WallpaperLayer wallpaperId="mono" enabled />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      'https://cdn.jtucker.io/bg/mono/original-640.webp',
    );
  });

  it('renders nothing but the vignette for the "none" wallpaper', () => {
    const { container } = render(<WallpaperLayer wallpaperId="none" enabled />);
    expect(container.querySelector('img')).toBeNull();
  });

  it('fetches no image when disabled (mobile / Save-Data)', () => {
    const { container } = render(<WallpaperLayer wallpaperId="mono" enabled={false} />);
    expect(container.querySelector('img')).toBeNull();
  });
});
