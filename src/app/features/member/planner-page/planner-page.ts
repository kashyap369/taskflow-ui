import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { Excalidraw, loadFromBlob, serializeAsJSON } from '@excalidraw/excalidraw';
import type {
  ExcalidrawInitialDataState,
  ExcalidrawProps,
} from '@excalidraw/excalidraw/types';
import { createElement } from 'react';
import { Root, createRoot } from 'react-dom/client';
import {
  CloudOff,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Save,
  ShieldCheck,
} from 'lucide-angular';

import { AuthService } from '@core/auth/auth.service';
import { ThemeService } from '@core/services/theme.service';

type CanvasChangeHandler = NonNullable<ExcalidrawProps['onChange']>;
type SaveState = 'ready' | 'saving' | 'saved' | 'error';

@Component({
  selector: 'app-planner-page',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './planner-page.html',
  styleUrl: './planner-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ CloudOff, Save, ShieldCheck }),
    },
  ],
})
export class PlannerPage implements AfterViewInit, OnDestroy {
  @ViewChild('canvasHost', { static: true }) private canvasHost!: ElementRef<HTMLDivElement>;

  private readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);
  private readonly zone = inject(NgZone);
  private root: Root | null = null;
  private saveTimer: number | null = null;
  private pendingScene: string | null = null;
  private readonly plannerStorageKey =
    `taskflow-planner:${this.auth.user()?.id ?? 'signed-out'}`;

  readonly saveState = signal<SaveState>('ready');
  readonly savedAt = signal<Date | null>(null);

  private readonly onCanvasChange: CanvasChangeHandler = (elements, appState, files) => {
    this.pendingScene = serializeAsJSON(elements, appState, files, 'local');
    this.zone.run(() => this.saveState.set('saving'));

    if (this.saveTimer !== null) {
      window.clearTimeout(this.saveTimer);
    }

    this.saveTimer = window.setTimeout(() => this.persistPendingScene(), 600);
  };

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.root = createRoot(this.canvasHost.nativeElement);
      this.root.render(
        createElement(Excalidraw, {
          initialData: this.loadInitialData(),
          onChange: this.onCanvasChange,
          langCode: 'en',
        }),
      );
    });
  }

  ngOnDestroy(): void {
    if (this.saveTimer !== null) {
      window.clearTimeout(this.saveTimer);
    }
    this.persistPendingScene();
    this.root?.unmount();
    this.root = null;
  }

  saveLabel(): string {
    switch (this.saveState()) {
      case 'saving':
        return 'Saving…';
      case 'saved':
        return 'Saved in this browser';
      case 'error':
        return 'Could not save locally';
      default:
        return 'Private browser autosave';
    }
  }

  private async loadInitialData(): Promise<ExcalidrawInitialDataState | null> {
    const stored = localStorage.getItem(this.plannerStorageKey);
    if (!stored) {
      return {
        elements: [],
        appState: {
          theme: this.theme.isDark() ? 'dark' : 'light',
          viewBackgroundColor: this.theme.isDark() ? '#14141f' : '#ffffff',
        },
        files: {},
      };
    }

    try {
      return await loadFromBlob(
        new Blob([stored], { type: 'application/json' }),
        null,
        null,
      );
    } catch {
      localStorage.removeItem(this.plannerStorageKey);
      this.zone.run(() => this.saveState.set('error'));
      return null;
    }
  }

  private persistPendingScene(): void {
    if (this.pendingScene === null) {
      return;
    }

    try {
      localStorage.setItem(this.plannerStorageKey, this.pendingScene);
      this.pendingScene = null;
      this.zone.run(() => {
        this.savedAt.set(new Date());
        this.saveState.set('saved');
      });
    } catch {
      this.zone.run(() => this.saveState.set('error'));
    }
  }

}
