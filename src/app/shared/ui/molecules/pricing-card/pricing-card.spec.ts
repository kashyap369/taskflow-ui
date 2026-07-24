import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingCard } from './pricing-card';

describe('PricingCard', () => {

  let component: PricingCard;
  let fixture: ComponentFixture<PricingCard>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [PricingCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PricingCard);
    component = fixture.componentInstance;

    component.plan = {
      title: 'Pro',
      description: 'For growing teams.',
      price: '$12',
      duration: 'per user / month',
      buttonText: 'Start Free Trial',
      features: [
        'Unlimited Projects',
        'Priority Support'
      ]
    };

    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Pro');
  });

  it('should render description', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('For growing teams.');
  });

  it('should render price', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('$12');
  });

  it('should render button text', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Start Free Trial');
  });

  it('should render all features', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Unlimited Projects');
    expect(compiled.textContent).toContain('Priority Support');
  });

  it('should render badge when provided', () => {

    component.plan = {
      ...component.plan,
      badge: 'MOST POPULAR'
    };

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('MOST POPULAR');

  });

});