import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MeetingCollaborationRepository } from '@core/meetings/meeting-collaboration.repository';
import { MeetingCollaborationPanel } from './meeting-collaboration-panel';

describe('MeetingCollaborationPanel', () => { let fixture: ComponentFixture<MeetingCollaborationPanel>;
  beforeEach(async () => { const repository = { messages: () => of({ items: [], total: 0, skip: 0, take: 100 }), note: () => of({ content: '', version: 0, lastEditedByParticipantId: null, lastEditedByName: null, updatedAt: null, canEdit: true }), assets: () => of([]), archive: () => of(null) };
    await TestBed.configureTestingModule({ imports: [MeetingCollaborationPanel], providers: [{ provide: MeetingCollaborationRepository, useValue: repository }] }).compileComponents();
    fixture = TestBed.createComponent(MeetingCollaborationPanel); fixture.componentRef.setInput('meetingId', 41); fixture.detectChanges(); });
  it('loads the durable collaboration tabs', () => { expect(fixture.componentInstance).toBeTruthy(); expect(fixture.nativeElement.textContent).toContain('Chat'); expect(fixture.nativeElement.textContent).toContain('Archive'); }); });
