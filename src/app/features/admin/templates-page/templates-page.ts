import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Archive, Check, Edit3, LibraryBig, LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, Plus, Send, X } from 'lucide-angular';
import { DialogDirective } from '@shared/directives/dialog.directive';
import { controlValidators, messageFor } from '@shared/validations';
import { PLANNER_OBJECT_LABELS, PLANNER_TEMPLATE_STATUS_LABELS, PlannerObjectType, PlannerTemplate, PlannerTemplateDefinition } from '@core/models/planner-template.model';
import { AdminFacade } from '../admin.facade';
import { PlannerTemplateFormModel } from '../admin.form-models';

@Component({ selector: 'app-admin-templates-page', standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, DialogDirective],
  templateUrl: './templates-page.html', styleUrl: './templates-page.scss',
  providers: [{ provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider({ Archive, Check, Edit3, LibraryBig, Plus, Send, X }) }],
})
export class AdminTemplatesPage {
  private readonly facade = inject(AdminFacade); private readonly fb = inject(FormBuilder);
  readonly templates = this.facade.plannerTemplates; readonly loading = this.facade.templatesLoading; readonly saving = this.facade.templateSaving;
  readonly drawerOpen = signal(false); readonly editing = signal<PlannerTemplate | null>(null); readonly jsonError = signal<string | null>(null);
  readonly publishedCount = computed(() => this.templates().filter((x) => x.status === 2 && x.isActive).length);
  readonly labels = PLANNER_OBJECT_LABELS; readonly statusLabels = PLANNER_TEMPLATE_STATUS_LABELS;
  readonly objectTypes: PlannerObjectType[] = [1, 2, 3, 4, 5];
  private readonly rules = controlValidators(PlannerTemplateFormModel);
  readonly form = this.fb.nonNullable.group({ name: ['', this.rules['name']], objectType: [2 as PlannerObjectType], icon: ['ListTodo', this.rules['icon']], header: ['Task', this.rules['header']], backgroundColor: ['#f3f0ff'], strokeColor: ['#7048e8'], defaultWidth: [260, this.rules['defaultWidth']], defaultHeight: [120, this.rules['defaultHeight']], visibleFields: ['title,description,priority,progress', this.rules['visibleFields']], defaultValuesJson: ['{}', this.rules['defaultValuesJson']], sortOrder: [0, this.rules['sortOrder']], isActive: [true] });
  constructor() { this.facade.loadPlannerTemplates(); }
  fieldError(name: string): string | null { return messageFor(this.form, name); }
  onObjectTypeChange(): void {
    const type = this.form.controls.objectType.value;
    const presets: Record<PlannerObjectType, { icon: string; header: string; fields: string }> = {
      1: { icon: 'FolderKanban', header: 'Project', fields: 'title,description,problemStatement,budgetAmount,budgetCurrency,approximateDurationWeeks,progress,dates' },
      2: { icon: 'ListTodo', header: 'Task', fields: 'title,description,priority,startDate,expectedCompletionDate,progress,requirementState' },
      3: { icon: 'CheckSquare', header: 'Subtask', fields: 'title,completionState' },
      4: { icon: 'StickyNote', header: 'Note', fields: 'title,content' },
      5: { icon: 'FileText', header: 'Document', fields: 'title,fileName,contentType,size' },
    };
    const preset = presets[type];
    if (preset) this.form.patchValue({ objectType: type, icon: preset.icon, header: preset.header, visibleFields: preset.fields, defaultValuesJson: '{}' });
  }
  openCreate(): void { this.editing.set(null); this.jsonError.set(null); this.form.reset({ name: '', objectType: 2, icon: 'ListTodo', header: 'Task', backgroundColor: '#f3f0ff', strokeColor: '#7048e8', defaultWidth: 260, defaultHeight: 120, visibleFields: 'title,description,priority,progress', defaultValuesJson: '{}', sortOrder: this.templates().length * 10, isActive: true }); this.form.controls.objectType.enable(); this.drawerOpen.set(true); }
  openEdit(item: PlannerTemplate): void { this.editing.set(item); this.jsonError.set(null); this.form.reset({ ...item, visibleFields: (JSON.parse(item.visibleFieldsJson) as string[]).join(','), defaultValuesJson: item.defaultValuesJson }); this.form.controls.objectType.disable(); this.drawerOpen.set(true); }
  close(): void { this.drawerOpen.set(false); this.editing.set(null); this.form.controls.objectType.enable(); }
  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue(); let defaults: unknown;
    try { defaults = JSON.parse(value.defaultValuesJson); if (!defaults || Array.isArray(defaults) || typeof defaults !== 'object') throw new Error(); } catch { this.jsonError.set('Defaults must be a valid JSON object.'); return; }
    const payload: PlannerTemplateDefinition = { ...value, visibleFieldsJson: JSON.stringify(value.visibleFields.split(',').map((x) => x.trim()).filter(Boolean)), defaultValuesJson: JSON.stringify(defaults) };
    delete (payload as PlannerTemplateDefinition & { visibleFields?: string }).visibleFields;
    this.facade.savePlannerTemplate(this.editing()?.id ?? null, payload, () => this.close());
  }
  publish(item: PlannerTemplate): void { this.facade.publishPlannerTemplate(item.id); }
  archive(item: PlannerTemplate): void { if (window.confirm(`Archive “${item.name}”? Existing cards will keep its published version.`)) this.facade.archivePlannerTemplate(item.id); }
}
