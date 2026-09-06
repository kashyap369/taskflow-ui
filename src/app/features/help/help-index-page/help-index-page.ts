import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
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
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  Users,
  Video,
} from 'lucide-angular';

import { AuthStore } from '@core/auth/auth.store';
import { GuidanceService } from '@core/guidance/guidance.service';
import { HelpTopic } from '@core/guidance/guidance.models';

/**
 * The documentation index — "How to use TaskFlow".
 *
 * Opens with the relational model rather than a list of links, because
 * the thing new organization users get wrong is not where a page is; it
 * is how the pages relate. Once someone knows that permissions come
 * from roles and that tasks live in projects, the rest of the product
 * explains itself.
 */
@Component({
  selector: 'app-help-index-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './help-index-page.html',
  styleUrl: './help-index-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        BarChart3,
        CalendarDays,
        CheckSquare,
        FolderKanban,
        FolderOpen,
        LayoutDashboard,
        Mail,
        Search,
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
export class HelpIndexPage {
  private readonly auth = inject(AuthStore);

  readonly guidance = inject(GuidanceService);

  readonly query = signal('');

  private readonly portal = computed<'organization' | 'member'>(() =>
    this.auth.portal() === 'organization' ? 'organization' : 'member',
  );

  readonly topics = computed<HelpTopic[]>(() => {
    const all = this.guidance.topicsForPortal(this.portal());
    const term = this.query().trim().toLowerCase();

    if (!term) {
      return all;
    }

    return all.filter(
      (topic) =>
        topic.label.toLowerCase().includes(term) || topic.summary.toLowerCase().includes(term),
    );
  });

  readonly isOrganization = computed(() => this.portal() === 'organization');

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
