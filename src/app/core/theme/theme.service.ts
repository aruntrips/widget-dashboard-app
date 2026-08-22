import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _theme = signal<ThemeMode>('light');
  readonly theme = this._theme.asReadonly();

  setTheme(theme: ThemeMode): void {
    this._theme.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggle(): void {
    this.setTheme(this._theme() === 'light' ? 'dark' : 'light');
  }
}
