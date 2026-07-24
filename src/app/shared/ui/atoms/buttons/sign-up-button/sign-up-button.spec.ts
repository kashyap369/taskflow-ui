import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpButton } from './sign-up-button';

describe('SignUpButton', () => {
  let component: SignUpButton;
  let fixture: ComponentFixture<SignUpButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignUpButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
