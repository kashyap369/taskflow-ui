import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { APP_SETTINGS } from '@core/config/app.tokens';
import { AppSettings } from '@core/config/app.settings';
import { AdminTemplatesPage } from './templates-page';
describe('AdminTemplatesPage',()=>{it('creates',async()=>{await TestBed.configureTestingModule({imports:[AdminTemplatesPage],providers:[provideHttpClient(),provideHttpClientTesting(),provideAnimations(),provideToastr(),{provide:APP_SETTINGS,useValue:AppSettings}]}).compileComponents();expect(TestBed.createComponent(AdminTemplatesPage).componentInstance).toBeTruthy();});});
