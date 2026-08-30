import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_SETTINGS } from '@core/config/app.tokens';
import { MeetingStatus } from './meetings.models';
import { MeetingsRepository } from './meetings.repository';

describe('MeetingsRepository', () => {
  let repository: MeetingsRepository; let http: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(),
    { provide: APP_SETTINGS, useValue: { production: false, api: { baseUrl: 'https://taskflow.test/api' }, features: { planner: true, meetingsProbe: false } } },
  ] }); repository = TestBed.inject(MeetingsRepository); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());

  it('sends bounded list filters to the organization route', () => {
    repository.list(7, { fromUtc: '2026-01-01T00:00:00Z', toUtc: '2026-12-31T00:00:00Z', status: MeetingStatus.Scheduled, search: 'review', skip: 20, take: 10 }).subscribe();
    const request = http.expectOne((candidate) => candidate.url === 'https://taskflow.test/api/meeting/organization/7');
    expect(request.request.params.get('status')).toBe('2'); expect(request.request.params.get('search')).toBe('review');
    expect(request.request.params.get('skip')).toBe('20'); expect(request.request.params.get('take')).toBe('10');
    request.flush({ items: [], total: 0, skip: 20, take: 10 });
  });

  it('keeps lifecycle actions on focused meeting routes', () => {
    repository.start(41).subscribe(); const request = http.expectOne('https://taskflow.test/api/meeting/41/start');
    expect(request.request.method).toBe('POST'); expect(request.request.body).toEqual({}); request.flush(null);
  });
});
