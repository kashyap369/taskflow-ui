import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { LandingPage } from './landing-page';

describe('LandingPage', () => {
  let component: LandingPage;
  let fixture: ComponentFixture<LandingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPage],
      // Phase 6 replaced the hero/CTA dead buttons with real `routerLink`s and injected Router for
      // the pricing CTA, so the page now needs router providers.
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('routes the pricing CTA to registration', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate');
    component.choosePlan();
    expect(navigate).toHaveBeenCalledWith(['/auth/register']);
  });

  it('scrolls to the product preview instead of opening a non-existent demo', () => {
    // The fixture renders the real `#product-preview`, and `getElementById` returns that one — so
    // spy on it rather than appending a second element with the same id.
    const target = document.getElementById('product-preview');
    expect(target).withContext('#product-preview anchor must exist').toBeTruthy();

    const scrollIntoView = spyOn(target as HTMLElement, 'scrollIntoView');
    component.scrollToPreview();

    expect(scrollIntoView).toHaveBeenCalled();
  });
});
