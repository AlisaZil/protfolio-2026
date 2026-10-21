import { PRELOAD_ASSETS, preloadAssets } from './preload';

describe('preloadAssets', () => {
  // The test browser has no image.decode(); provide one to control.
  const proto = HTMLImageElement.prototype as { decode?: () => Promise<void> };
  beforeEach(() => (proto.decode = () => Promise.resolve()));
  afterEach(() => {
    vi.restoreAllMocks();
    delete proto.decode;
  });

  it('loads every file and reports progress up to 100%', async () => {
    const decode = vi.spyOn(HTMLImageElement.prototype, 'decode').mockResolvedValue();
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(new Blob(['x'])));
    const progress: number[] = [];

    await preloadAssets((fraction) => progress.push(fraction));

    const images = PRELOAD_ASSETS.filter((a) => !a.endsWith('.mp3'));
    expect(decode).toHaveBeenCalledTimes(images.length);
    expect(fetchSpy).toHaveBeenCalledWith('sounds/meow.mp3');
    expect(progress.at(-1)).toBe(1);
  });

  it('keeps going when a file fails to load', async () => {
    vi.spyOn(HTMLImageElement.prototype, 'decode').mockRejectedValue(new Error('missing'));
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    const progress: number[] = [];

    await preloadAssets((fraction) => progress.push(fraction));
    expect(progress.at(-1)).toBe(1);
  });
});
