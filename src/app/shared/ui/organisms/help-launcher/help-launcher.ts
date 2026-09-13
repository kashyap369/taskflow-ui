import { LowerCasePipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
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

/** The corners the launcher can be parked in. */
export const HELP_LAUNCHER_CORNERS = ['bottom-right', 'bottom-left', 'top-right', 'top-left'] as const;

export type HelpLauncherCorner = (typeof HELP_LAUNCHER_CORNERS)[number];

/**
 * The floating help button, bottom-right of every portal page until the
 * user drags it somewhere else.
 *
 * Four behaviours are deliberate and easy to undo by accident:
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
 * 4. **It can be moved, but only between the four corners.** Whichever
 *    corner it defaults to will sooner or later sit on top of a control
 *    someone needs, so the user drags it out of the way and it snaps to
 *    the nearest corner. See {@link corner} for why it snaps rather than
 *    landing wherever it was dropped.
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

  /** Where a moved launcher is remembered, per browser. */
  private static readonly CORNER_KEY = 'taskflow.help.corner';

  /**
   * How far the pointer must travel before a press counts as a drag
   * rather than a click. Small enough that dragging feels immediate,
   * large enough that the shake in an ordinary click is not a move.
   */
  private static readonly DRAG_THRESHOLD_PX = 4;

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

  /**
   * Which corner the launcher sits in.
   *
   * Any fixed corner eventually covers something — a table row's last
   * action, a footer control, a third-party widget on the same page.
   * Rather than guess which corner is safe, the button is draggable and
   * snaps to whichever of the four the pointer released nearest, and the
   * choice is remembered so it is a decision made once.
   *
   * Snapping rather than free placement is deliberate: a control that can
   * be dropped anywhere can be dropped half off-screen, or straight over
   * the thing it was moved to uncover.
   */
  readonly corner = signal<HelpLauncherCorner>(this.readCorner());

  /** True only once the pointer has travelled past the drag threshold. */
  readonly dragging = signal(false);

  /** Viewport position of the launcher's top-left corner, while dragging. */
  readonly dragPoint = signal<{ x: number; y: number } | null>(null);

  readonly launcherClass = computed(() => ({
    ['is-' + this.corner()]: true,
    'is-dragging': this.dragging(),
  }));

  private pointerStart: { x: number; y: number } | null = null;
  private grab: { x: number; y: number; width: number; height: number } | null = null;
  private suppressClick = false;

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
    // A drag finishes with a click on the button it started from. That
    // click belongs to the move, not to the menu.
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }

    this.clearTeaserTimers();
    this.teasing.set(false);
    this.open.update((value) => !value);
  }

  onPointerDown(event: PointerEvent): void {
    // Ignore secondary mouse buttons; touch and pen report button 0 too.
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    const fab = event.currentTarget as HTMLElement;
    const rect = fab.getBoundingClientRect();

    this.suppressClick = false;
    this.pointerStart = { x: event.clientX, y: event.clientY };
    this.grab = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };

    // Keeps the moves coming to this element even when the pointer
    // outruns it, which it will on a fast drag.
    fab.setPointerCapture(event.pointerId);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.pointerStart || !this.grab) {
      return;
    }

    if (!this.dragging()) {
      const travelled = Math.hypot(
        event.clientX - this.pointerStart.x,
        event.clientY - this.pointerStart.y,
      );

      if (travelled < HelpLauncher.DRAG_THRESHOLD_PX) {
        return;
      }

      // It is a drag now. Get the menu and the teaser out of the way so
      // the user is moving the button alone.
      this.dragging.set(true);
      this.open.set(false);
      this.teasing.set(false);
      this.clearTeaserTimers();
    }

    // Clamped, so the launcher cannot be dropped over the edge of the
    // viewport and stranded there.
    const maxX = Math.max(window.innerWidth - this.grab.width, 0);
    const maxY = Math.max(window.innerHeight - this.grab.height, 0);

    this.dragPoint.set({
      x: Math.min(Math.max(event.clientX - this.grab.x, 0), maxX),
      y: Math.min(Math.max(event.clientY - this.grab.y, 0), maxY),
    });
  }

  onPointerUp(): void {
    const point = this.dragPoint();
    const grab = this.grab;
    const dragged = this.dragging();

    this.pointerStart = null;
    this.grab = null;
    this.dragging.set(false);
    this.dragPoint.set(null);

    if (!dragged || !point || !grab) {
      return;
    }

    this.suppressClick = true;
    this.setCorner(this.nearestCorner(point.x + grab.width / 2, point.y + grab.height / 2));
  }

  /**
   * Moves the launcher with the keyboard, which a drag cannot serve.
   * Alt is required so that the bare arrow keys a screen-reader user
   * navigates with keep doing what they have always done.
   */
  onFabKeydown(event: KeyboardEvent): void {
    if (!event.altKey) {
      return;
    }

    const [vertical, horizontal] = this.corner().split('-');
    let next: HelpLauncherCorner;

    switch (event.key) {
      case 'ArrowUp':
        next = ('top-' + horizontal) as HelpLauncherCorner;
        break;
      case 'ArrowDown':
        next = ('bottom-' + horizontal) as HelpLauncherCorner;
        break;
      case 'ArrowLeft':
        next = (vertical + '-left') as HelpLauncherCorner;
        break;
      case 'ArrowRight':
        next = (vertical + '-right') as HelpLauncherCorner;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.setCorner(next);
  }

  private nearestCorner(centreX: number, centreY: number): HelpLauncherCorner {
    const vertical = centreY < window.innerHeight / 2 ? 'top' : 'bottom';
    const horizontal = centreX < window.innerWidth / 2 ? 'left' : 'right';

    return (vertical + '-' + horizontal) as HelpLauncherCorner;
  }

  private readCorner(): HelpLauncherCorner {
    try {
      const stored = localStorage.getItem(HelpLauncher.CORNER_KEY) as HelpLauncherCorner | null;

      return stored && HELP_LAUNCHER_CORNERS.includes(stored) ? stored : 'bottom-right';
    } catch {
      // Private mode, or storage disabled entirely. The default corner is
      // a perfectly good answer.
      return 'bottom-right';
    }
  }

  private setCorner(corner: HelpLauncherCorner): void {
    this.corner.set(corner);

    try {
      localStorage.setItem(HelpLauncher.CORNER_KEY, corner);
    } catch {
      // The move still applies for this session, it just will not outlive it.
    }
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
