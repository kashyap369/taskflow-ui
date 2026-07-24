import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  FolderKanban,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Plus,
  X,
} from 'lucide-angular';

import { projectStatusMeta } from '../organization.models';
import { OrganizationFacade } from '../organization.facade';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Plus,
        X,
        FolderKanban,
        CalendarDays,
        ArrowRight,
        Building2,
      }),
    },
  ],
})
export class ProjectsPage {
  private readonly facade = inject(OrganizationFacade);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly projects = this.facade.projects;
  readonly currentOrg = this.facade.currentOrg;
  readonly needsOrganization = this.facade.needsOrganization;

  readonly projectStatusMeta = projectStatusMeta;

  readonly showCreate = signal(false);

  readonly hasProjects = computed(() => this.projects().length > 0);

  readonly createForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(1000)]],
    startDate: [this.today(), [Validators.required]],
    expectedCompletionDate: [''],
  });

  constructor() {
    this.facade.init();
  }

  openCreate(): void {
    this.createForm.reset({ title: '', description: '', startDate: this.today(), expectedCompletionDate: '' });
    this.showCreate.set(true);
  }

  closeCreate(): void {
    this.showCreate.set(false);
  }

  submit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const { title, description, startDate, expectedCompletionDate } = this.createForm.getRawValue();

    this.facade.createProject({
      title,
      description,
      startDate: this.toIso(startDate),
      expectedCompletionDate: expectedCompletionDate ? this.toIso(expectedCompletionDate) : null,
    });

    this.closeCreate();
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  /** `YYYY-MM-DD` from a date input → a UTC ISO string the API can bind to DateTime. */
  private toIso(date: string): string {
    return new Date(`${date}T00:00:00Z`).toISOString();
  }
}
