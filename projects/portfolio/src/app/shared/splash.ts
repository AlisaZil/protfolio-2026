// Controls the loading screen written in index.html (#splash).

export function setSplashProgress(fraction: number): void {
  document.getElementById('splash')?.style.setProperty('--progress', String(fraction));
}

/** Fades the loading screen out, then removes it. */
export function hideSplash(): void {
  const splash = document.getElementById('splash');
  if (!splash) return;
  splash.classList.add('is-done');
  setTimeout(() => splash.remove(), 600);
}
