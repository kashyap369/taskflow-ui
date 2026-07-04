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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
