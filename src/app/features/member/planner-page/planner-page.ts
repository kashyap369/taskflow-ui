import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  Excalidraw,
  convertToExcalidrawElements,
  loadFromBlob,
  serializeAsJSON,
} from '@excalidraw/excalidraw';
import type {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
  ExcalidrawProps,
} from '@excalidraw/excalidraw/types';
import { createElement } from 'react';
import { Root, createRoot } from 'react-dom/client';
import {
  ArrowLeft,
  Cloud,
  CloudOff,
  FolderKanban,
  History,
  FileText,
  Link,
  StickyNote,
  Upload,
  Download,
  ExternalLink,
  LibraryBig,
  LoaderCircle,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  PanelRight,
  Plus,
  ListPlus,
  Workflow,
  Trash2,
  Unlink,
  RefreshCw,
  Save,
  ShieldCheck,
  TriangleAlert,
  X,
} from 'lucide-angular';

import { AuthService } from '@core/auth/auth.service';
import { PLANNER_OBJECT_LABELS, PlannerTemplate, PlannerTemplateVersion } from '@core/models/planner-template.model';
import { ThemeService } from '@core/services/theme.service';
import { DialogDirective } from '@shared/directives/dialog.directive';
import { controlValidators, messageFor } from '@shared/validations';
import { ProjectFormModel } from '@features/organization/organization.form-models';
import { MemberFacade } from '../member.facade';
import { PlannerFacade } from './planner.facade';
import { PlannerNode, PlannerNodeType, RequirementChangeType } from './planner.models';

type CanvasChangeHandler = NonNullable<ExcalidrawProps['onChange']>;
type CanvasElements = Parameters<CanvasChangeHandler>[0];
type CanvasAppState = Parameters<CanvasChangeHandler>[1];

interface LegacySceneDocument {
  type?: string;
  version?: number;
  elements?: { type?: string; isDeleted?: boolean; [key: string]: unknown }[];
  appState?: Record<string, unknown>;
  files?: Record<string, unknown>;
  [key: string]: unknown;
}

@Component({
  selector: 'app-planner-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    DialogDirective,
  ],
  templateUrl: './planner-page.html',
  styleUrl: './planner-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        ArrowLeft,
        Cloud,
        CloudOff,
        FolderKanban,
        History,
        FileText,
        Link,
        StickyNote,
        Upload,
        Download,
        ExternalLink,
        LibraryBig,
        LoaderCircle,
        PanelRight,
        Plus,
        ListPlus,
        Workflow,
        Trash2,
        Unlink,
        RefreshCw,
        Save,
        ShieldCheck,
        TriangleAlert,
        X,
      }),
    },
  ],
})
export class PlannerPage implements AfterViewInit, OnDestroy {
  @ViewChild('canvasHost', { static: true }) private canvasHost!: ElementRef<HTMLDivElement>;

  private readonly auth = inject(AuthService);
  private readonly memberFacade = inject(MemberFacade);
  private readonly planner = inject(PlannerFacade);
  private readonly theme = inject(ThemeService);
  private readonly zone = inject(NgZone);
  private readonly fb = inject(FormBuilder);
  private root: Root | null = null;
  private excalidrawApi: ExcalidrawImperativeAPI | null = null;
  private activeProjectId: number | null = null;
  private suppressInitialCanvasChange = false;
  private canvasStageTimer: number | null = null;
  private pendingCanvasSnapshot: { elements: CanvasElements; appState: CanvasAppState } | null = null;
  private legacySceneJson: string | null = null;
  private readonly viewReady = signal(false);

  readonly projects = this.memberFacade.projects;
  readonly loading = this.memberFacade.projectsLoading;
  readonly loadError = this.memberFacade.projectsError;
  readonly savingProject = this.memberFacade.saving;
  readonly syncState = this.planner.syncState;
  readonly syncError = this.planner.syncError;
  readonly conflict = this.planner.conflict;
  readonly savedAt = this.planner.savedAt;
  readonly recoveryAvailable = this.planner.recoveryAvailable;
  readonly workspace = this.planner.workspace;
  readonly nodesLoading = this.planner.nodesLoading;
  readonly nodeSaving = this.planner.nodeSaving;
  readonly nodeError = this.planner.nodeError;
  readonly canvasMounted = signal(false);
  readonly legacySceneAvailable = signal(false);
  readonly legacyEmbeddedFileCount = signal(0);
  readonly legacyImporting = signal(false);
  readonly legacyImportError = signal<string | null>(null);
  readonly selectedProjectId = signal<number | null>(this.readLastProjectId());
  readonly selectedProject = computed(() => {
    const projects = this.projects();
    return projects.find((project) => project.id === this.selectedProjectId()) ?? projects[0] ?? null;
  });
  readonly showCreateProject = signal(false);
  readonly showNodeCreator = signal(false);
  readonly createNodeType = signal<PlannerNodeType>(2);
  readonly showInspector = signal(false);
  readonly showLibrary = signal(false);
  readonly showResourceCreator = signal(false);
  readonly showRequirements = signal(false);
  readonly requirementFilter = signal<'' | RequirementChangeType>('');
  readonly resourceKind = signal<'note' | 'link' | 'document'>('note');
  readonly selectedFile = signal<File | null>(null);
  readonly templates = this.planner.templates;
  readonly templatesLoading = this.planner.templatesLoading;
  readonly resources = this.planner.resources;
  readonly resourcesLoading = this.planner.resourcesLoading;
  readonly requirementBaselines = this.planner.requirementBaselines;
  readonly selectedBaseline = this.planner.selectedBaseline;
  readonly requirementChanges = this.planner.requirementChanges;
  readonly requirementComparison = this.planner.requirementComparison;
  readonly requirementsLoading = this.planner.requirementsLoading;
  readonly requirementsSaving = this.planner.requirementsSaving;
  readonly requirementsError = this.planner.requirementsError;
  readonly hasBaseline = computed(() => this.requirementBaselines().length > 0);
  readonly unlinkedResources = computed(() => this.resources().filter((resource) => !resource.nodeId));
  readonly selectedTemplateVersion = signal<PlannerTemplateVersion | null>(null);
  readonly objectLabels = PLANNER_OBJECT_LABELS;
  readonly selectedNodeId = signal<string | null>(null);
  readonly selectedNode = computed(() =>
    this.workspace()?.nodes.find((node) => node.nodeId === this.selectedNodeId()) ?? null,
  );
  readonly taskNodes = computed(() => this.workspace()?.nodes.filter((node) => node.nodeType === 2) ?? []);
  readonly projectLinked = computed(() => this.workspace()?.nodes.some((node) => node.nodeType === 1) ?? false);

  private readonly rules = controlValidators(ProjectFormModel);
  readonly projectForm = this.fb.nonNullable.group({
    title: ['', this.rules['title']],
    description: ['', this.rules['description']],
    startDate: [this.today(), this.rules['startDate']],
    expectedCompletionDate: [''],
  });

  readonly nodeForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.maxLength(2000)],
    startDate: [this.today(), Validators.required],
    expectedCompletionDate: [''],
    priority: [2],
    taskId: [0],
    problemStatement: ['', Validators.maxLength(4000)],
    budgetAmount: [''],
    budgetCurrency: ['USD', [Validators.minLength(3), Validators.maxLength(3)]],
    approximateDurationWeeks: [''],
    changeReason: ['', Validators.maxLength(500)],
  });

  readonly resourceForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    content: ['', [Validators.maxLength(20000)]],
    url: ['', [Validators.maxLength(2048)]],
    fileName: [''],
  });

  private readonly onCanvasChange: CanvasChangeHandler = (elements, appState) => {
    if (this.activeProjectId === null) {
      return;
    }

    if (this.suppressInitialCanvasChange) {
      this.suppressInitialCanvasChange = false;
      return;
    }

    const selectedElementId = Object.keys(appState.selectedElementIds ?? {}).find(
      (id) => appState.selectedElementIds[id],
    );
    if (selectedElementId) {
      const selected = elements.find((element) => element.id === selectedElementId);
      const container = selected && 'containerId' in selected && selected.containerId
        ? elements.find((element) => element.id === selected.containerId)
        : selected;
      const nodeId = container?.customData?.['plannerNodeId'];
      if (typeof nodeId === 'string' && nodeId !== this.selectedNodeId()) {
        this.zone.run(() => this.selectedNodeId.set(nodeId));
      }
    }

    const hasEmbeddedFile = elements.some(
      (element) => element.type === 'image' && !element.isDeleted,
    );
    if (hasEmbeddedFile) {
      this.clearPendingCanvasStage();
      this.zone.run(() => this.planner.reportEmbeddedFiles());
      return;
    }

    const elementCount = elements.reduce(
      (count, element) => count + (element.isDeleted ? 0 : 1),
      0,
    );
    if (elementCount > 5_000) {
      this.clearPendingCanvasStage();
      this.zone.run(() => this.planner.reportSceneLimit());
      return;
    }

    this.pendingCanvasSnapshot = { elements, appState };
    if (this.canvasStageTimer !== null) {
      window.clearTimeout(this.canvasStageTimer);
    }
    this.canvasStageTimer = window.setTimeout(() => this.flushPendingCanvasStage(), 250);
  };

  constructor() {
    this.memberFacade.initProjects();

    effect(() => {
      const project = this.selectedProject();
      if (project) {
        this.selectedProjectId.set(project.id);
        this.rememberProject(project.id);
      }
    });

    effect(() => {
      const ready = this.viewReady();
      const projectId = this.selectedProject()?.id ?? null;

      if (!ready) {
        return;
      }

      queueMicrotask(() => {
        if ((this.selectedProject()?.id ?? null) !== projectId) {
          return;
        }
        if (projectId === null) {
          this.destroyCanvas();
        } else {
          void this.mountCanvas(projectId);
        }
      });
    });
  }

  ngAfterViewInit(): void {
    this.viewReady.set(true);
  }

  ngOnDestroy(): void {
    this.flushPendingCanvasStage();
    void this.planner.flush();
    this.destroyCanvas();
  }

  async selectProject(value: string): Promise<void> {
    const projectId = Number(value);
    if (!Number.isInteger(projectId) || projectId === this.selectedProject()?.id) {
      return;
    }

    this.flushPendingCanvasStage();
    await this.planner.flush();
    this.selectedProjectId.set(projectId);
  }

  retryProjects(): void {
    this.memberFacade.loadProjects();
  }

  retryBoard(): void {
    const projectId = this.selectedProject()?.id;
    if (projectId) {
      this.destroyCanvas();
      void this.mountCanvas(projectId);
    }
  }

  retrySave(): void {
    this.planner.retry();
  }

  refreshLinkedWork(): void {
    const projectId = this.selectedProject()?.id;
    if (projectId) {
      void this.planner.refreshWorkspace(projectId);
    }
  }

  async keepLocalVersion(): Promise<void> {
    await this.planner.keepLocalVersion();
  }

  async useServerVersion(): Promise<void> {
    this.clearPendingCanvasStage();
    const sceneJson = await this.planner.useServerVersion();
    const projectId = this.selectedProject()?.id;
    if (sceneJson && projectId) {
      this.destroyCanvas();
      this.activeProjectId = projectId;
      this.renderCanvas(sceneJson);
    }
  }

  openCreateProject(): void {
    this.projectForm.reset({
      title: '',
      description: '',
      startDate: this.today(),
      expectedCompletionDate: '',
    });
    this.showCreateProject.set(true);
  }

  closeCreateProject(): void {
    this.showCreateProject.set(false);
  }

  projectFieldError(property: string): string | null {
    return messageFor(this.projectForm, property);
  }

  createProject(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const value = this.projectForm.getRawValue();
    this.memberFacade.createProject(
      {
        title: value.title,
        description: value.description,
        startDate: this.toIso(value.startDate),
        expectedCompletionDate: value.expectedCompletionDate
          ? this.toIso(value.expectedCompletionDate)
          : null,
      },
      (projectId) => {
        this.selectedProjectId.set(projectId);
        this.closeCreateProject();
      },
    );
  }

  openNodeCreator(type: PlannerNodeType): void {
    this.createNodeType.set(type);
    this.nodeForm.reset({
      title: type === 1 ? (this.workspace()?.project.title ?? '') : '',
      description: type === 1 ? (this.workspace()?.project.description ?? '') : '',
      startDate: this.workspace()?.project.startDate?.slice(0, 10) ?? this.today(),
      expectedCompletionDate: this.workspace()?.project.expectedCompletionDate?.slice(0, 10) ?? '',
      priority: 2,
      taskId: this.taskNodes()[0]?.entityId ?? 0,
      problemStatement: this.workspace()?.project.problemStatement ?? '',
      budgetAmount: this.workspace()?.project.budgetAmount?.toString() ?? '',
      budgetCurrency: this.workspace()?.project.budgetCurrency ?? 'USD',
      approximateDurationWeeks: this.workspace()?.project.approximateDurationWeeks?.toString() ?? '',
      changeReason: '',
    });
    this.showNodeCreator.set(true);
  }

  openLibrary(): void {
    this.showLibrary.set(true);
    void Promise.all([this.planner.loadTemplates(), this.planner.loadResources()]);
  }
  closeLibrary(): void { this.showLibrary.set(false); }
  useTemplate(template: PlannerTemplate): void {
    const version = template.versions.find((x) => x.versionNumber === template.currentVersionNumber) ?? null;
    if (!version) return;
    this.selectedTemplateVersion.set(version); this.closeLibrary();
    if (template.objectType === 4 || template.objectType === 5) {
      this.openResourceCreator(template.objectType === 4 ? 'note' : 'document');
      const resourceDefaults = JSON.parse(version.defaultValuesJson) as Record<string, unknown>;
      this.resourceForm.patchValue({
        title: typeof resourceDefaults['title'] === 'string' ? resourceDefaults['title'] : '',
        content: typeof resourceDefaults['content'] === 'string' ? resourceDefaults['content'] : '',
        url: typeof resourceDefaults['url'] === 'string' ? resourceDefaults['url'] : '',
      });
      return;
    }
    this.openNodeCreator(template.objectType as PlannerNodeType);
    const defaults = JSON.parse(version.defaultValuesJson) as Record<string, unknown>;
    this.nodeForm.patchValue({ title: typeof defaults['title'] === 'string' ? defaults['title'] : this.nodeForm.controls.title.value, description: typeof defaults['description'] === 'string' ? defaults['description'] : this.nodeForm.controls.description.value, priority: typeof defaults['priority'] === 'number' ? defaults['priority'] : this.nodeForm.controls.priority.value, problemStatement: typeof defaults['problemStatement'] === 'string' ? defaults['problemStatement'] : this.nodeForm.controls.problemStatement.value, budgetCurrency: typeof defaults['budgetCurrency'] === 'string' ? defaults['budgetCurrency'] : this.nodeForm.controls.budgetCurrency.value });
  }

  openResourceCreator(kind: 'note' | 'link' | 'document'): void {
    const expectedType = kind === 'note' ? 4 : 5;
    if (this.selectedTemplateVersion()?.objectType !== expectedType) this.selectedTemplateVersion.set(null);
    this.resourceKind.set(kind);
    this.resourceForm.reset({ title: '', content: '', url: '', fileName: '' });
    this.selectedFile.set(null);
    this.showResourceCreator.set(true);
  }

  closeResourceCreator(): void {
    this.showResourceCreator.set(false);
    this.selectedFile.set(null);
    this.selectedTemplateVersion.set(null);
  }

  chooseFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedFile.set(file);
    if (file) this.resourceForm.patchValue({ fileName: file.name, title: this.resourceForm.controls.title.value || file.name });
  }

  async createResource(): Promise<void> {
    if (this.resourceForm.invalid || (this.resourceKind() === 'document' && !this.selectedFile()) ||
      (this.resourceKind() === 'note' && !this.resourceForm.controls.content.value.trim()) ||
      (this.resourceKind() === 'link' && !this.validHttpUrl(this.resourceForm.controls.url.value))) {
      this.resourceForm.markAllAsTouched(); return;
    }
    const value = this.resourceForm.getRawValue();
    const elementId = crypto.randomUUID();
    const templateId = this.selectedTemplateVersion()?.id;
    let nodeId: string | null;
    if (this.resourceKind() === 'note') {
      nodeId = await this.planner.createNote({ elementId, title: value.title.trim(), content: value.content.trim(), templateVersionId: templateId });
    } else if (this.resourceKind() === 'link') {
      nodeId = await this.planner.createLink({ elementId, title: value.title.trim(), url: value.url.trim(), templateVersionId: templateId });
    } else {
      nodeId = await this.planner.uploadDocument(elementId, value.title.trim(), this.selectedFile()!, templateId);
    }
    const node = this.workspace()?.nodes.find((item) => item.nodeId === nodeId);
    if (node) { this.addCanvasNode(node); this.selectedNodeId.set(node.nodeId); }
    if (nodeId) this.closeResourceCreator();
  }

  async linkSavedResource(resourceId: string): Promise<void> {
    const nodeId = await this.planner.linkResource(resourceId, crypto.randomUUID());
    const node = this.workspace()?.nodes.find((item) => item.nodeId === nodeId);
    if (node) this.addCanvasNode(node);
  }

  closeNodeCreator(): void {
    this.showNodeCreator.set(false);
    this.selectedTemplateVersion.set(null);
  }

  async createNode(): Promise<void> {
    if (this.nodeForm.invalid || (this.createNodeType() === 3 && this.nodeForm.controls.taskId.value <= 0)) {
      this.nodeForm.markAllAsTouched();
      return;
    }
    const value = this.nodeForm.getRawValue();
    const elementId = crypto.randomUUID();
    let nodeId: string | null = null;
    if (this.createNodeType() === 1) {
      nodeId = await this.planner.linkProject(elementId, this.selectedTemplateVersion()?.id);
    } else if (this.createNodeType() === 2) {
      nodeId = await this.planner.createTaskNode({
        elementId,
        title: value.title.trim(),
        description: value.description.trim(),
        startDate: this.toIso(value.startDate),
        priority: value.priority,
        expectedCompletionDate: value.expectedCompletionDate ? this.toIso(value.expectedCompletionDate) : null,
        templateVersionId: this.selectedTemplateVersion()?.id,
        changeReason: value.changeReason.trim() || null,
      });
    } else {
      nodeId = await this.planner.createSubTaskNode({
        elementId,
        taskId: value.taskId,
        title: value.title.trim(),
        templateVersionId: this.selectedTemplateVersion()?.id,
        changeReason: value.changeReason.trim() || null,
      });
    }
    if (!nodeId) {
      return;
    }
    const node = this.workspace()?.nodes.find((item) => item.nodeId === nodeId);
    if (node) {
      this.addCanvasNode(node);
      this.selectedNodeId.set(node.nodeId);
    }
    this.memberFacade.loadProjects();
    this.closeNodeCreator();
  }

  async openDetails(): Promise<void> {
    await this.planner.refreshWorkspace(this.selectedProject()?.id ?? null);
    const node = this.selectedNode() ?? this.workspace()?.nodes[0] ?? null;
    this.selectedNodeId.set(node?.nodeId ?? null);
    if (node) {
      if (node.nodeType > 3) this.populateResourceForm(node);
      else this.populateNodeForm(node);
    }
    this.showInspector.set(true);
  }

  closeInspector(): void {
    this.showInspector.set(false);
  }

  chooseInspectorNode(nodeId: string): void {
    this.selectedNodeId.set(nodeId);
    const node = this.selectedNode();
    if (node) {
      if (node.nodeType > 3) this.populateResourceForm(node);
      else this.populateNodeForm(node);
    }
  }

  async updateSelectedNode(): Promise<void> {
    const node = this.selectedNode();
    if (!node || this.nodeForm.invalid) {
      this.nodeForm.markAllAsTouched();
      return;
    }
    const value = this.nodeForm.getRawValue();
    const updated = await this.planner.updateNode(node.nodeId, {
      title: value.title.trim(),
      description: node.nodeType === 3 ? null : value.description.trim(),
      expectedCompletionDate: node.nodeType === 3 || !value.expectedCompletionDate
        ? null
        : this.toIso(value.expectedCompletionDate),
      priority: node.nodeType === 2 ? value.priority : null,
      problemStatement: node.nodeType === 1 ? value.problemStatement.trim() || null : null,
      budgetAmount: node.nodeType === 1 && value.budgetAmount !== '' ? Number(value.budgetAmount) : null,
      budgetCurrency: node.nodeType === 1 && value.budgetAmount !== '' ? value.budgetCurrency.toUpperCase() : null,
      approximateDurationWeeks:
        node.nodeType === 1 && value.approximateDurationWeeks !== ''
          ? Number(value.approximateDurationWeeks)
          : null,
      changeReason: value.changeReason.trim() || null,
    });
    if (updated) {
      this.memberFacade.loadProjects();
      const refreshed = this.workspace()?.nodes.find((item) => item.nodeId === node.nodeId);
      if (refreshed) {
        this.refreshCanvasNode(refreshed);
        this.populateNodeForm(refreshed);
      }
    }
  }

  async updateSelectedResource(): Promise<void> {
    const node = this.selectedNode();
    if (!node?.resourceId || this.resourceForm.invalid ||
      (node.resourceKind === 1 && !this.resourceForm.controls.content.value.trim()) ||
      (node.resourceKind === 2 && !this.validHttpUrl(this.resourceForm.controls.url.value))) {
      this.resourceForm.markAllAsTouched(); return;
    }
    const value = this.resourceForm.getRawValue();
    const updated = await this.planner.updateResource(node.resourceId, {
      title: value.title.trim(),
      content: node.resourceKind === 1 ? value.content.trim() : null,
      url: node.resourceKind === 2 ? value.url.trim() : null,
      fileName: node.resourceKind === 3 ? value.fileName.trim() : null,
    });
    if (updated) {
      const refreshed = this.workspace()?.nodes.find((item) => item.nodeId === node.nodeId);
      if (refreshed) { this.refreshCanvasNode(refreshed); this.populateResourceForm(refreshed); }
    }
  }

  async removeSelectedNode(deleteEntity: boolean): Promise<void> {
    const node = this.selectedNode();
    if (!node) {
      return;
    }
    if (deleteEntity && !window.confirm(`Delete “${node.title}” from TaskFlow and unlink its canvas card?`)) {
      return;
    }
    const changeReason = deleteEntity && this.hasBaseline()
      ? window.prompt('Optional: explain why this requirement is being removed.')
      : null;
    const removed = deleteEntity && node.resourceId
      ? await this.planner.deleteResource(node.resourceId)
      : await this.planner.removeNode(node.nodeId, deleteEntity, changeReason);
    if (removed) {
      this.memberFacade.loadProjects();
      this.removeCanvasElement(node.elementId);
      this.selectedNodeId.set(null);
      this.closeInspector();
    }
  }

  async openRequirements(): Promise<void> {
    this.showRequirements.set(true);
    await this.planner.loadRequirements(this.selectedProject()?.id ?? null,
      this.requirementFilter() || null);
  }

  closeRequirements(): void { this.showRequirements.set(false); }

  async finalizeRequirements(): Promise<void> {
    if (!window.confirm(
      'Finalize these primary requirements? Baseline 1 is immutable and cannot be overwritten.',
    )) return;
    await this.planner.finalizeRequirements();
  }

  async filterRequirementChanges(value: string): Promise<void> {
    const filter = value === '' ? '' : Number(value) as RequirementChangeType;
    this.requirementFilter.set(filter);
    await this.planner.loadRequirements(this.selectedProject()?.id ?? null, filter || null);
  }

  requirementTypeLabel(type: number): string {
    return type === 1 ? 'Project' : type === 2 ? 'Task' : 'Subtask';
  }

  requirementChangeLabel(type: RequirementChangeType): string {
    return type === 1 ? 'New' : type === 2 ? 'Changed' : 'Removed';
  }

  fieldLabel(field: string): string {
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, (value) => value.toUpperCase());
  }

  nodeTypeLabel(type: PlannerNodeType): string {
    return type === 1 ? 'Project' : type === 2 ? 'Task' : type === 3 ? 'Subtask' : type === 4 ? 'Note' : 'Document';
  }

  statusLabel(status: number): string {
    return ['Unknown', 'To do', 'In progress', 'Completed'][status] ?? 'Unknown';
  }

  saveLabel(): string {
    switch (this.syncState()) {
      case 'loading':
        return 'Loading cloud board…';
      case 'saving':
        return 'Saving to cloud…';
      case 'saved':
        return 'Saved to cloud';
      case 'offline':
        return 'Offline recovery active';
      case 'conflict':
        return 'Resolve sync conflict';
      case 'error':
        return 'Cloud sync needs attention';
      default:
        return this.recoveryAvailable()
          ? 'Cloud autosave ready'
          : 'Cloud save only · no recovery cache';
    }
  }

  private async mountCanvas(projectId: number): Promise<void> {
    if (this.activeProjectId === projectId && this.root !== null) {
      return;
    }

    this.destroyCanvas();
    this.activeProjectId = projectId;
    this.canvasMounted.set(false);

    const sceneJson = await this.planner.openProject(projectId);
    await this.planner.refreshWorkspace(projectId);
    await this.planner.loadResources(projectId);
    if (this.activeProjectId !== projectId || this.selectedProject()?.id !== projectId) {
      return;
    }

    this.renderCanvas(sceneJson);
    this.offerLegacyScene(projectId);
  }

  dismissLegacyImport(): void {
    const projectId = this.selectedProject()?.id;
    if (projectId) sessionStorage.setItem(this.legacyDismissKey(projectId), 'true');
    this.legacySceneAvailable.set(false);
  }

  async importLegacyScene(): Promise<void> {
    const projectId = this.selectedProject()?.id;
    if (!projectId || !this.legacySceneJson || this.legacyImporting()) return;
    const legacy = this.sanitizeLegacyScene(this.legacySceneJson);
    if (!legacy) {
      this.legacyImportError.set('This legacy drawing is unreadable. It remains stored in this browser.');
      return;
    }

    this.legacyImporting.set(true);
    this.legacyImportError.set(null);
    this.clearPendingCanvasStage();
    this.destroyCanvas();
    this.activeProjectId = projectId;
    this.renderCanvas(legacy.sceneJson);
    this.planner.stageScene(legacy.sceneJson);
    await this.planner.flush();

    if (this.syncState() === 'saved') {
      localStorage.setItem(
        this.legacyMigrationKey(),
        JSON.stringify({ projectId, importedAt: new Date().toISOString(), omittedImages: legacy.omittedImages }),
      );
      this.legacySceneAvailable.set(false);
      this.legacySceneJson = null;
    } else {
      this.legacyImportError.set(
        'The cloud import did not finish. Your original browser drawing is unchanged; retry when sync is available.',
      );
    }
    this.legacyImporting.set(false);
  }

  private renderCanvas(sceneJson: string): void {
    this.suppressInitialCanvasChange = true;
    this.zone.runOutsideAngular(() => {
      this.root = createRoot(this.canvasHost.nativeElement);
      this.root.render(
        createElement(Excalidraw, {
          initialData: this.loadInitialData(sceneJson),
          onChange: this.onCanvasChange,
          excalidrawAPI: (api: ExcalidrawImperativeAPI) => {
            this.excalidrawApi = api;
          },
          langCode: 'en',
        }),
      );
    });
    this.canvasMounted.set(true);
  }

  private destroyCanvas(): void {
    this.clearPendingCanvasStage();
    this.root?.unmount();
    this.root = null;
    this.excalidrawApi = null;
    this.activeProjectId = null;
    this.canvasMounted.set(false);
  }

  private async loadInitialData(sceneJson: string): Promise<ExcalidrawInitialDataState | null> {
    try {
      const initialData = await loadFromBlob(
        new Blob([sceneJson], { type: 'application/json' }),
        null,
        null,
      );

      if (!initialData.appState?.theme) {
        initialData.appState = {
          ...initialData.appState,
          theme: this.theme.isDark() ? 'dark' : 'light',
          viewBackgroundColor: this.theme.isDark() ? '#14141f' : '#ffffff',
        };
      }
      return this.rehydrateLinkedNodes(initialData);
    } catch {
      return this.rehydrateLinkedNodes({
        elements: [],
        appState: {
          theme: this.theme.isDark() ? 'dark' : 'light',
          viewBackgroundColor: this.theme.isDark() ? '#14141f' : '#ffffff',
        },
        files: {},
      });
    }
  }

  private lastProjectStorageKey(): string {
    return `taskflow-planner:${this.auth.user()?.id ?? 'signed-out'}:last-project`;
  }

  private readLastProjectId(): number | null {
    const value = Number(localStorage.getItem(this.lastProjectStorageKey()));
    return Number.isInteger(value) && value > 0 ? value : null;
  }

  private rememberProject(projectId: number): void {
    localStorage.setItem(this.lastProjectStorageKey(), String(projectId));
  }

  private flushPendingCanvasStage(): void {
    if (this.canvasStageTimer !== null) {
      window.clearTimeout(this.canvasStageTimer);
      this.canvasStageTimer = null;
    }
    const snapshot = this.pendingCanvasSnapshot;
    this.pendingCanvasSnapshot = null;
    if (!snapshot || this.activeProjectId === null) return;
    const sceneJson = serializeAsJSON(snapshot.elements, snapshot.appState, {}, 'database');
    this.zone.run(() => this.planner.stageScene(sceneJson));
  }

  private clearPendingCanvasStage(): void {
    if (this.canvasStageTimer !== null) window.clearTimeout(this.canvasStageTimer);
    this.canvasStageTimer = null;
    this.pendingCanvasSnapshot = null;
  }

  private offerLegacyScene(projectId: number): void {
    this.legacySceneAvailable.set(false);
    this.legacyImportError.set(null);
    if (localStorage.getItem(this.legacyMigrationKey()) ||
      sessionStorage.getItem(this.legacyDismissKey(projectId))) return;
    const sceneJson = localStorage.getItem(this.legacyStorageKey());
    if (!sceneJson) return;

    this.legacySceneJson = sceneJson;
    const parsed = this.readLegacyScene(sceneJson);
    this.legacyEmbeddedFileCount.set(parsed?.omittedImages ?? 0);
    if (!parsed) {
      this.legacyImportError.set('This legacy drawing is unreadable. It remains stored in this browser.');
    }
    this.legacySceneAvailable.set(true);
  }

  private sanitizeLegacyScene(sceneJson: string): { sceneJson: string; omittedImages: number } | null {
    const parsed = this.readLegacyScene(sceneJson);
    if (!parsed) return null;
    return {
      sceneJson: JSON.stringify({
        ...parsed.document,
        type: 'excalidraw',
        version: 2,
        source: 'taskflow-legacy-import',
        elements: parsed.document.elements?.filter((element) => element.type !== 'image') ?? [],
        files: {},
      }),
      omittedImages: parsed.omittedImages,
    };
  }

  private readLegacyScene(sceneJson: string):
    { document: LegacySceneDocument; omittedImages: number } | null {
    try {
      const document = JSON.parse(sceneJson) as LegacySceneDocument;
      if (!Array.isArray(document.elements)) return null;
      const imageElements = document.elements.filter(
        (element) => element.type === 'image' && !element.isDeleted,
      ).length;
      return {
        document,
        omittedImages: Math.max(imageElements, Object.keys(document.files ?? {}).length),
      };
    } catch {
      return null;
    }
  }

  private legacyStorageKey(): string {
    return `taskflow-planner:${this.auth.user()?.id ?? 'signed-out'}`;
  }

  private legacyMigrationKey(): string {
    return `${this.legacyStorageKey()}:cloud-import-v1`;
  }

  private legacyDismissKey(projectId: number): string {
    return `${this.legacyStorageKey()}:dismiss-import:${projectId}`;
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private toIso(date: string): string {
    return new Date(`${date}T00:00:00Z`).toISOString();
  }

  private populateNodeForm(node: PlannerNode): void {
    this.nodeForm.reset({
      title: node.title,
      description: node.description ?? '',
      startDate: node.startDate?.slice(0, 10) ?? this.today(),
      expectedCompletionDate: node.expectedCompletionDate?.slice(0, 10) ?? '',
      priority: node.priority ?? 2,
      taskId: node.parentEntityId ?? 0,
      problemStatement: node.problemStatement ?? '',
      budgetAmount: node.budgetAmount?.toString() ?? '',
      budgetCurrency: node.budgetCurrency ?? 'USD',
      approximateDurationWeeks: node.approximateDurationWeeks?.toString() ?? '',
    });
  }

  private populateResourceForm(node: PlannerNode): void {
    this.resourceForm.reset({ title: node.title, content: node.description ?? '',
      url: node.resourceUrl ?? '', fileName: node.asset?.fileName ?? '' });
  }

  async openResource(node: PlannerNode, download: boolean): Promise<void> {
    if (node.resourceKind === 2 && node.resourceUrl) {
      window.open(node.resourceUrl, '_blank', 'noopener,noreferrer'); return;
    }
    if (!node.resourceId || !node.asset) return;
    const blob = await this.planner.getResourceContent(node.resourceId, download);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    if (download) {
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = node.asset.fileName;
      anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer'); window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
  }

  formatBytes(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }

  private validHttpUrl(value: string): boolean {
    try { const url = new URL(value); return url.protocol === 'http:' || url.protocol === 'https:'; }
    catch { return false; }
  }

  private nodeLabel(node: PlannerNode): string {
    if (node.nodeType === 4) return `Note · ${node.title}\n${(node.description ?? '').slice(0, 120)}`;
    if (node.nodeType === 5) {
      const detail = node.asset ? `${node.asset.fileName} · ${this.formatBytes(node.asset.size)}` : node.resourceUrl ?? 'Link';
      return `Document · ${node.title}\n${detail}`;
    }
    const progress = node.nodeType === 3
      ? this.statusLabel(node.status)
      : `${node.completedChildCount}/${node.childCount} ${node.nodeType === 1 ? 'tasks' : 'subtasks'} · ${Math.round(node.completionPercentage)}%`;
    return `${this.nodeTypeLabel(node.nodeType)} · ${node.title}\n${progress}`;
  }

  private nodeSkeleton(
    node: PlannerNode,
    index = 0,
  ): NonNullable<Parameters<typeof convertToExcalidrawElements>[0]>[number] {
    const palette = node.templateVersion ? { backgroundColor: node.templateVersion.backgroundColor, strokeColor: node.templateVersion.strokeColor } : node.nodeType === 1
      ? { backgroundColor: '#e7f5ff', strokeColor: '#1971c2' }
      : node.nodeType === 2
        ? { backgroundColor: '#f3f0ff', strokeColor: '#7048e8' }
        : node.nodeType === 3
          ? { backgroundColor: '#ebfbee', strokeColor: '#2f9e44' }
          : node.nodeType === 4
            ? { backgroundColor: '#fff9db', strokeColor: '#f08c00' }
            : { backgroundColor: '#e6fcf5', strokeColor: '#099268' };
    return {
      id: node.elementId,
      type: 'rectangle',
      x: 180 + (index % 3) * 300,
      y: 180 + Math.floor(index / 3) * 170,
      width: node.templateVersion?.defaultWidth ?? 250,
      height: node.templateVersion?.defaultHeight ?? 112,
      fillStyle: 'solid',
      roughness: 1,
      roundness: { type: 3 },
      ...palette,
      customData: { plannerNodeId: node.nodeId, plannerNodeType: node.nodeType },
      label: { text: this.nodeLabel(node), fontSize: 18 },
    };
  }

  private addCanvasNode(node: PlannerNode): void {
    if (!this.excalidrawApi) {
      return;
    }
    const elements = this.excalidrawApi.getSceneElements();
    const created = convertToExcalidrawElements([this.nodeSkeleton(node, elements.length)], {
      regenerateIds: false,
    });
    this.excalidrawApi.updateScene({ elements: [...elements, ...created] });
    this.excalidrawApi.scrollToContent(created, { fitToContent: true, animate: true });
  }

  private refreshCanvasNode(node: PlannerNode): void {
    if (!this.excalidrawApi) {
      return;
    }
    const elements = this.excalidrawApi.getSceneElements();
    const container = elements.find((element) => element.id === node.elementId);
    const labelId = container?.boundElements?.find((item) => item.type === 'text')?.id;
    const next = elements.map((element) => {
      if (element.id === node.elementId) {
        return { ...element, customData: { ...element.customData, plannerNodeId: node.nodeId, plannerNodeType: node.nodeType }, version: element.version + 1 };
      }
      if (labelId && element.id === labelId && element.type === 'text') {
        return { ...element, text: this.nodeLabel(node), originalText: this.nodeLabel(node), version: element.version + 1 };
      }
      return element;
    });
    this.excalidrawApi.updateScene({ elements: next });
  }

  private removeCanvasElement(elementId: string): void {
    if (!this.excalidrawApi) {
      return;
    }
    const elements = this.excalidrawApi.getSceneElementsIncludingDeleted();
    const container = elements.find((element) => element.id === elementId);
    const linkedIds = new Set([elementId, ...(container?.boundElements?.map((item) => item.id) ?? [])]);
    this.excalidrawApi.updateScene({
      elements: elements.map((element) =>
        linkedIds.has(element.id) ? { ...element, isDeleted: true, version: element.version + 1 } : element,
      ),
    });
  }

  private rehydrateLinkedNodes(initialData: ExcalidrawInitialDataState): ExcalidrawInitialDataState {
    const nodes = this.workspace()?.nodes ?? [];
    const existing = [...(initialData.elements ?? [])];
    const ids = new Set(existing.map((element) => element.id));
    const missing = nodes.filter((node) => !ids.has(node.elementId));
    const created = missing.length
      ? convertToExcalidrawElements(
          missing.map((node, index) => this.nodeSkeleton(node, existing.length + index)),
          { regenerateIds: false },
        )
      : [];
    const hydrated = existing.map((element) => {
      const node = nodes.find((item) => item.elementId === element.id);
      if (node) {
        return { ...element, customData: { ...element.customData, plannerNodeId: node.nodeId, plannerNodeType: node.nodeType } };
      }
      if (element.type === 'text' && element.containerId) {
        const containerNode = nodes.find((item) => item.elementId === element.containerId);
        if (containerNode) {
          const label = this.nodeLabel(containerNode);
          return { ...element, text: label, originalText: label };
        }
      }
      return element;
    });
    return { ...initialData, elements: [...hydrated, ...created] };
  }
}
