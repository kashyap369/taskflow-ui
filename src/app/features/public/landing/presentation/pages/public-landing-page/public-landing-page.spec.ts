import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicLandingPage } from './public-landing-page';

describe('PublicLandingPage', () => {
  let component: PublicLandingPage;
  let fixture: ComponentFixture<PublicLandingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicLandingPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicLandingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
