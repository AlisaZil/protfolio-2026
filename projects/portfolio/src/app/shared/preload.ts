/** Files to load before the site appears, so photos and sounds are ready instantly. */
export const PRELOAD_ASSETS = [
  'images/gosha.png',
  'images/grisha-looking.png',
  'images/grisha-looking-up.png',
  'images/flag-en.svg',
  'flags/il.svg',
  'sounds/meow.mp3',
];

/** Never keep visitors waiting longer than this, even on a very slow connection. */
const MAX_WAIT_MS = 10_000;

/**
 * Loads every asset (and the fonts), reporting progress as each one finishes.
 * Files that fail to load are skipped rather than blocking the site.
 */
export async function preloadAssets(onProgress: (fraction: number) => void): Promise<void> {
  const tasks: Promise<unknown>[] = [
    ...PRELOAD_ASSETS.map((url) => (/\.(png|jpe?g|svg|webp)$/.test(url) ? loadImage(url) : loadFile(url))),
    document.fonts?.ready ?? Promise.resolve(),
  ];

  let done = 0;
  const tracked = tasks.map((task) =>
    task.catch(() => {}).finally(() => onProgress(++done / tasks.length)),
  );

  await Promise.race([Promise.all(tracked), new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS))]);
}

function loadImage(url: string): Promise<void> {
  const image = new Image();
  image.src = url;
  if (typeof image.decode === 'function') return image.decode();
  return new Promise((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
  });
}

async function loadFile(url: string): Promise<void> {
  const response = await fetch(url);
  await response.blob(); // download it fully, so the browser has it cached
}
