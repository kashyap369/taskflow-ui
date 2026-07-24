import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterCard } from './master-card';

describe('MasterCard', () => {
  let component: MasterCard;
  let fixture: ComponentFixture<MasterCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterCard);
    component = fixture.componentInstance;
    component.config = {
      variant: 'achievement',
      title: 'Power User',
      subtitle: 'Completed 200+ tasks',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
