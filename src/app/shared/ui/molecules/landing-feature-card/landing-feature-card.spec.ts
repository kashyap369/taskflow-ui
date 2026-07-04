import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingFeatureCard } from './landing-feature-card';

describe('LandingFeatureCard', () => {
  let component: LandingFeatureCard;
  let fixture: ComponentFixture<LandingFeatureCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingFeatureCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingFeatureCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
