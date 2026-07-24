import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideLottieOptions } from 'ngx-lottie';

import { LottiePlayer } from './lottie-player';

describe('LottiePlayer', () => {
  let component: LottiePlayer;
  let fixture: ComponentFixture<LottiePlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LottiePlayer],
      providers: [
        provideHttpClient(),
        provideLottieOptions({ player: () => import('lottie-web') }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LottiePlayer);
    fixture.componentRef.setInput('src', '/lottie/loading-dots.json');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
