import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  let component: Skeleton;
  let fixture: ComponentFixture<Skeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Skeleton] }).compileComponents();
    fixture = TestBed.createComponent(Skeleton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to a line appearance', () => {
    expect(component.appearance()).toBe('line');
  });

  it('switches to a circle appearance and rounds fully when circle=true', () => {
    fixture.componentRef.setInput('circle', true);
    fixture.detectChanges();
    expect(component.appearance()).toBe('circle');
    expect(component.skeletonTheme()['border-radius']).toBe('50%');
  });

  it('passes the token background and caller geometry through to the theme', () => {
    fixture.componentRef.setInput('width', '120px');
    fixture.componentRef.setInput('height', '2rem');
    fixture.detectChanges();
    const theme = component.skeletonTheme();
    expect(theme['background-color']).toBe('var(--surface-inset)');
    expect(theme.width).toBe('120px');
    expect(theme.height).toBe('2rem');
  });
});
