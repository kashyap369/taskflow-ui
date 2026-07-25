import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PublicFooter } from './public-footer';

describe('PublicFooter', () => {
  let component: PublicFooter;
  let fixture: ComponentFixture<PublicFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicFooter],
      providers: [provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicFooter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
