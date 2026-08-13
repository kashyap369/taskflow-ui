import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, HostListener, inject, OnDestroy, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Cookie,
  FileLock2,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Scale,
} from 'lucide-angular';

import { LEGAL_DOCUMENTS, LegalDocumentKey } from './legal-documents';

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './legal-page.html',
  styleUrl: './legal-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        ArrowUpRight,
        Check,
        ChevronDown,
        Cookie,
        FileLock2,
        Scale,
      }),
    },
  ],
})
export class LegalPage implements AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly documentRef = inject(DOCUMENT);
  private scrollFrame?: number;

  readonly documents = Object.values(LEGAL_DOCUMENTS);
  readonly document =
    LEGAL_DOCUMENTS[this.route.snapshot.data['documentKey'] as LegalDocumentKey];
  readonly activeSection = signal(this.document.sections[0]?.id ?? '');

  constructor() {
    inject(Title).setTitle(`${this.document.title} · TaskFlow`);
    inject(Meta).updateTag({ name: 'description', content: this.document.description });
  }

  ngAfterViewInit(): void {
    const view = this.documentRef.defaultView;

    if (!view) return;

    const initialSection = decodeURIComponent(view.location.hash.slice(1));
    if (initialSection) {
      view.setTimeout(() => this.scrollToSectionId(initialSection, false), 0);
    } else {
      this.scheduleActiveSectionUpdate();
    }
  }

  ngOnDestroy(): void {
    const view = this.documentRef.defaultView;
    if (view && this.scrollFrame !== undefined) view.cancelAnimationFrame(this.scrollFrame);
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange(): void {
    this.scheduleActiveSectionUpdate();
  }

  scrollToSection(event: MouseEvent, sectionId: string): void {
    event.preventDefault();
    const details = (event.currentTarget as HTMLElement).closest('details');

    if (details) {
      details.querySelector('summary')?.focus({ preventScroll: true });
      details.removeAttribute('open');
    }

    this.scrollToSectionId(sectionId, true);
  }

  private scrollToSectionId(sectionId: string, updateHistory: boolean): void {
    const view = this.documentRef.defaultView;
    const section = this.documentRef.getElementById(sectionId);

    if (!view || !section) return;

    const reduceMotion = view.matchMedia('(prefers-reduced-motion: reduce)').matches;
    section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    this.activeSection.set(sectionId);

    if (updateHistory) {
      const fragment = encodeURIComponent(sectionId);
      view.history.pushState(null, '', `${view.location.pathname}${view.location.search}#${fragment}`);
    }
  }

  private scheduleActiveSectionUpdate(): void {
    const view = this.documentRef.defaultView;

    if (!view || this.scrollFrame !== undefined) return;

    this.scrollFrame = view.requestAnimationFrame(() => {
      this.scrollFrame = undefined;
      this.updateActiveSection();
    });
  }

  private updateActiveSection(): void {
    const view = this.documentRef.defaultView;
    if (!view || this.document.sections.length === 0) return;

    // The reading line sits below the sticky header and around the upper third of the viewport.
    // This updates the topic when its heading becomes the section the reader is actually viewing.
    const readingLine = Math.min(view.innerHeight * 0.35, 320);
    let currentId = this.document.sections[0].id;

    for (const section of this.document.sections) {
      const element = this.documentRef.getElementById(section.id);
      if (!element || element.getBoundingClientRect().top > readingLine) break;
      currentId = section.id;
    }

    const pageEnd =
      Math.ceil(view.scrollY + view.innerHeight) >= this.documentRef.documentElement.scrollHeight - 2;
    if (pageEnd) currentId = this.document.sections[this.document.sections.length - 1].id;

    this.keepActiveTopicVisible(currentId);
    if (this.activeSection() === currentId) return;

    this.activeSection.set(currentId);
    const fragment = encodeURIComponent(currentId);
    view.history.replaceState(null, '', `${view.location.pathname}${view.location.search}#${fragment}`);
  }

  private keepActiveTopicVisible(sectionId: string): void {
    const view = this.documentRef.defaultView;
    const toc = this.documentRef.querySelector<HTMLElement>('.legal-toc');
    const link = toc?.querySelector<HTMLElement>(`a[href="#${sectionId}"]`);

    if (!view || !toc || !link || toc.offsetParent === null) return;

    const tocRect = toc.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const linkOutsideView = linkRect.top < tocRect.top || linkRect.bottom > tocRect.bottom;

    if (!linkOutsideView) return;

    const reduceMotion = view.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const centeredTop = link.offsetTop - toc.clientHeight / 2 + link.clientHeight / 2;
    toc.scrollTo({ top: centeredTop, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
}
