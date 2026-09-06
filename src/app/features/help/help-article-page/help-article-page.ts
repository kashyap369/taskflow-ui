import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SafeHtml } from '@angular/platform-browser';
import { map, switchMap } from 'rxjs';
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckSquare,
  FolderKanban,
  FolderOpen,
  LayoutDashboard,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Mail,
  Settings,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  Users,
  Video,
} from 'lucide-angular';

import { GuidanceService } from '@core/guidance/guidance.service';
import { HelpTopic } from '@core/guidance/guidance.models';

import { HelpDocsService } from '../help-docs.service';

/**
 * One documentation page.
 *
 * A doc is shared by the topics that point at it — the projects list
 * and a single project are one subject to read about even though they
 * tour separately — so the sidebar of related links is built from every
 * topic using this slug, not from a single topic.
 */
@Component({
  selector: 'app-help-article-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './help-article-page.html',
  styleUrl: './help-article-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        ArrowLeft,
        BarChart3,
        CalendarDays,
        CheckSquare,
        FolderKanban,
        FolderOpen,
        LayoutDashboard,
        Mail,
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
export class HelpArticlePage {
  private readonly route = inject(ActivatedRoute);
  private readonly docs = inject(HelpDocsService);

  readonly guidance = inject(GuidanceService);

  readonly slug = toSignal(this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')), {
    initialValue: '',
  });

  /** Rendered HTML, or null while loading and when the file is missing. */
  readonly content = toSignal<SafeHtml | null>(
    this.route.paramMap.pipe(switchMap((params) => this.docs.load(params.get('slug') ?? ''))),
    { initialValue: null },
  );

  /** Topics documented by this page, in registry order. */
  readonly topics = computed<HelpTopic[]>(() => {
    const slug = this.slug();

    return [
      ...this.guidance.topicsForPortal('organization'),
      ...this.guidance.topicsForPortal('member'),
    ]
      .filter((topic) => topic.docSlug === slug)
      // A topic marked `both` appears in each portal list; keep one.
      .filter((topic, index, all) => all.findIndex((item) => item.key === topic.key) === index);
  });

  readonly title = computed(() => this.topics()[0]?.label ?? 'Documentation');

  /** Pages worth reading next, gathered across every topic on this page. */
  readonly related = computed<HelpTopic[]>(() => {
    const own = new Set(this.topics().map((topic) => topic.key));

    const keys = this.topics().flatMap((topic) => topic.related);

    return [...new Set(keys)]
      .filter((key) => !own.has(key))
      .map((key) => this.guidance.topicByKey(key))
      .filter((topic): topic is HelpTopic => topic !== null);
  });

  /**
   * The pages this document describes, as links.
   *
   * There is deliberately no "take the tour" button here: a tour
   * highlights real elements, and none of them are on screen while the
   * reader is in the documentation. Sending them to the page — where
   * the help button offers that page's tour — is the honest version.
   */
  routeFor(topic: HelpTopic): string {
    return topic.route;
  }
}
