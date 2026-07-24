import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewCard } from './review-card';

describe('ReviewCard', () => {

  let component: ReviewCard;
  let fixture: ComponentFixture<ReviewCard>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [ReviewCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewCard);

    component = fixture.componentInstance;

    fixture.componentRef.setInput('review', {
      title: 'Excellent Project Management',
      review:
        'TaskFlow replaced four other tools. Our team moves twice as fast and our roadmap is finally clear.',
      rating: 5,
      reviewerName: 'Sarah Lin',
      reviewerDesignation: 'VP Engineering',
      reviewerCompany: 'Northwind',
      avatarText: 'S',
      avatarBackground: '#7C4DFF',
      verified: true,
    });

    fixture.detectChanges();

  });

  it('should create', () => {

    expect(component).toBeTruthy();

  });

  it('should render review title', () => {

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Excellent Project Management');

  });

  it('should render review text', () => {

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'TaskFlow replaced four other tools.'
    );

  });

  it('should render reviewer name', () => {

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Sarah Lin');

  });

  it('should render reviewer designation', () => {

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('VP Engineering');

  });

  it('should render reviewer company', () => {

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Northwind');

  });

  it('should render avatar text', () => {

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('S');

  });

  it('should create five stars', () => {

    expect(component.stars().length).toBe(5);

  });

  it('should respect the rating value', () => {

    fixture.componentRef.setInput('review', {
      title: 'Good',
      review: 'Very nice.',
      rating: 4,
      reviewerName: 'John',
      reviewerDesignation: 'Developer',
      reviewerCompany: 'SugguUI',
    });

    fixture.detectChanges();

    expect(component.stars().length).toBe(4);

  });

  it('should never create more than five stars', () => {

    fixture.componentRef.setInput('review', {
      title: 'Overflow',
      review: 'Great',
      rating: 10,
      reviewerName: 'Alex',
      reviewerDesignation: 'Architect',
      reviewerCompany: 'SugguUI',
    });

    fixture.detectChanges();

    expect(component.stars().length).toBe(5);

  });

});