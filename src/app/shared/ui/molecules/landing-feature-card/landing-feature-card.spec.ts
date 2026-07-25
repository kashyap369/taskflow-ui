import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LUCIDE_ICONS, LucideIconProvider, Zap } from 'lucide-angular';

import { LandingFeatureCard } from './landing-feature-card';

describe('LandingFeatureCard', () => {
  let component: LandingFeatureCard;
  let fixture: ComponentFixture<LandingFeatureCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingFeatureCard],
      providers: [
        { provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider({ Zap }) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingFeatureCard);
    component = fixture.componentInstance;
    // `feature` is a required input — set it before change detection.
    fixture.componentRef.setInput('feature', {
      title: 'Fast',
      description: 'Ships in milliseconds.',
      icon: 'Zap',
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the provided feature title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Fast');
  });
});
