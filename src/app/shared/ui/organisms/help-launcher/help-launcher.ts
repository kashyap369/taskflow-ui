import { LowerCasePipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckSquare,
  FolderKanban,
  FolderOpen,
  LayoutDashboard,
  LifeBuoy,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Mail,
  Play,
  RotateCcw,
  Settings,
  Sparkles,
  SlidersHorizontal,
  UserRound,
  Users,
  Video,
} from 'lucide-angular';

import { GuidanceService } from '@core/guidance/guidance.service';
import { HelpTopic } from '@core/guidance/guidance.models';
import { TourService } from '@core/guidance/tour.service';

/**
 * The floating help button, bottom-right of every portal page.
 *
 * Three behaviours are deliberate and easy to undo by accident:
 *
 * 1. **The label never changes.** It always reads "Help". Text that
 *    cycles in the periphery is a permanent distraction in a tool
 *    people keep open all day, and it stops users forming a stable
 *    name for the control.
 *
 * 2. **It auto-expands once per page, then never again.** The teaser
 *    appears about two seconds after arriving on a page whose tour the
 *    user has not seen, then collapses on its own. Once a tour is taken
 *    or dismissed the page is quiet for good, and turning prompts off
 *    silences the teaser everywhere while leaving the button working.
 *
 * 3. **Clicking opens a menu, not a tour.** Sometimes the user wants to
 *    read rather than be walked through; the popover offers both, plus
 *    the pages related to this one, which is where the mental model of
 *    how TaskFlow fits together actually gets taught.
 *
 * The component renders nothing at all when the current route has no
 * topic — that is how the meeting room, the guest portal and the auth
 * pages stay clear.
 */
@Component({
  selector: 'app-help-launcher',
  standalone: true,
  imports: [NgClass, LowerCasePipe, RouterLink, LucideAngularModule],
  templateUrl: './help-launcher.html',
  styleUrl: './help-launcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      // The layouts register their own icon sets, and an element
      // injector resolves LUCIDE_ICONS at the nearest provider rather
      // than merging down the tree — so the launcher must carry every
      // icon it uses, including the topic icons from the registry.
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        BarChart3,
        BookOpen,
        CalendarDays,
        CheckSquare,
        FolderKanban,
        FolderOpen,
        LayoutDashboard,
        LifeBuoy,
        Mail,
        Play,
        RotateCcw,
        Settings,
        Sparkles,
        SlidersHorizontal,
        UserRound,
        Users,
        Video,
      }),
    },
  ],
})
export class HelpLauncher {
  private static readonly TEASER_DELAY_MS = 2000;
  private static readonly TEASER_VISIBLE_MS = 6000;

  /**
   * Longer than the teaser delay: the welcome opens a modal over the
   * page, so it waits for the dashboard's data to land rather than
   * appearing over a set of loading skeletons.
   */
  private static readonly WELCOME_DELAY_MS = 1200;

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly tours = inject(TourService);

  readonly guidance = inject(GuidanceService);

  readonly open = signal(false);

  /** True while the one-time teaser is showing the contextual line. */
  readonly teasing = signal(false);

  /** Pages the user has already been teased on, so it happens once. */
  private readonly teased = new Set<string>();

  private teaserTimers: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    // Close the menu and re-arm the teaser whenever the page changes.
    effect(() => {
      const topic = this.guidance.currentTopic();

      untracked(() => {
        this.open.set(false);
        this.clearTeaserTimers();
        this.teasing.set(false);

        if (!topic) {
          return;
        }

        // The first-run welcome takes precedence over any page teaser:
        // a brand-new user should be told how the product is shaped
        // before being offered a tour of one page inside it.
        if (this.tryStartWelcome()) {
          return;
        }

        this.armTeaser(topic);
      });
    });
  }

  /**
   * Runs the first-run welcome once, on the dashboard the user lands on
   * after signing in.
   *
   * Gated to the dashboard deliberately. The welcome explains the shape
   * of the whole product, which is the right thing to hear on arrival
   * and the wrong thing to have thrown at you three clicks deep into a
   * task you were already doing. Someone whose first ever page is not a
   * dashboard simply gets it the next time they visit one.
   */
  private tryStartWelcome(): boolean {
    const welcome = this.guidance.pendingWelcome();

    if (!welcome || !this.router.url.includes('/dashboard')) {
      return false;
    }

    this.teaserTimers.push(
      setTimeout(() => {
        // Do not talk over a tour the user started themselves in the
        // meantime, and re-check the flag — another tab may have
        // recorded the welcome while this timer was pending.
        if (this.tours.isRunning() || !this.guidance.pendingWelcome()) {
          return;
        }

        this.guidance.startWelcome();
      }, HelpLauncher.WELCOME_DELAY_MS),
    );

    return true;
  }

  label(): string {
    return 'Help';
  }

  startTour(): void {
    this.open.set(false);
    this.guidance.startCurrentTour();
  }

  restartTour(): void {
    this.open.set(false);
    this.guidance.restartCurrentTour();
  }

  toggle(): void {
    this.clearTeaserTimers();
    this.teasing.set(false);
    this.open.update((value) => !value);
  }

  /** Opens the docs at a specific topic and closes the menu behind it. */
  openDoc(topic: HelpTopic): void {
    this.open.set(false);
    void this.router.navigate(['/help', topic.docSlug]);
  }

  /** "Stop nudging me" — the button stays, the teaser does not. */
  silencePrompts(): void {
    this.guidance.progress.setPromptsEnabled(false);
    this.clearTeaserTimers();
    this.teasing.set(false);
    this.open.set(false);
  }

  isTourRunning(): boolean {
    return this.tours.isRunning();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.open()) {
      return;
    }

    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  /**
   * Shows the contextual teaser once per page, and only for a page the
   * user has not been through. The delay lets the page settle first —
   * a teaser that appears during the loading skeleton points at
   * nothing and reads as a popup.
   */
  private armTeaser(topic: HelpTopic): void {
    if (this.teased.has(topic.key) || !this.guidance.progress.shouldPrompt(topic.key)) {
      return;
    }

    this.teased.add(topic.key);

    this.teaserTimers.push(
      setTimeout(() => {
        // Never interrupt a tour that is already on screen.
        if (this.tours.isRunning()) {
          return;
        }

        this.teasing.set(true);

        this.teaserTimers.push(
          setTimeout(() => this.teasing.set(false), HelpLauncher.TEASER_VISIBLE_MS),
        );
      }, HelpLauncher.TEASER_DELAY_MS),
    );
  }

  private clearTeaserTimers(): void {
    this.teaserTimers.forEach((timer) => clearTimeout(timer));
    this.teaserTimers = [];
  }
}
