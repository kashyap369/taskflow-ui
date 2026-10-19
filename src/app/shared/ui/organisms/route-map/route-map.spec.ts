import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteMap } from './route-map';

describe('RouteMap', () => {
  let component: RouteMap;
  let fixture: ComponentFixture<RouteMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RouteMap] }).compileComponents();
    fixture = TestBed.createComponent(RouteMap);
    fixture.componentRef.setInput('tileUrl', 'about:blank#{z}/{x}/{y}');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * The punch pin is the one marker built as HTML rather than a Leaflet circle, because it has to
   * carry an image and a badge. These check what actually reaches the DOM.
   */
  it('draws a punch pin with its selfie and badge', async () => {
    fixture.componentRef.setInput('data', {
      lines: [],
      markers: [
        {
          id: 'in-7',
          latitude: 19.07,
          longitude: 72.88,
          tone: 'success',
          badge: 'IN',
          avatarUrl: 'blob:http://localhost/abc',
          tooltip: 'Punched in 09:00',
        },
      ],
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const pin = fixture.nativeElement.querySelector('.route-pin') as HTMLElement | null;
    expect(pin).withContext('a badged marker is drawn as a photo pin').toBeTruthy();
    expect(pin!.dataset['tone']).toBe('success');
    expect(pin!.querySelector('.route-pin-badge')!.textContent!.trim()).toBe('IN');
    expect(pin!.querySelector('img.route-pin-photo')!.getAttribute('src')).toBe('blob:http://localhost/abc');
  });

  it('shows the badge alone until the selfie has been fetched', async () => {
    fixture.componentRef.setInput('data', {
      lines: [],
      markers: [
        { id: 'out-7', latitude: 19.07, longitude: 72.88, tone: 'danger', badge: 'OUT', tooltip: 'Punched out' },
      ],
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('img.route-pin-photo')).toBeNull();
    expect(fixture.nativeElement.querySelector('.route-pin-photo.is-empty')).toBeTruthy();
  });

  it('escapes what it puts in the pin markup', async () => {
    fixture.componentRef.setInput('data', {
      lines: [],
      markers: [
        {
          id: 'in-7',
          latitude: 19.07,
          longitude: 72.88,
          tone: 'success',
          badge: '<img onerror="alert(1)">',
          tooltip: 'x',
        },
      ],
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const badge = fixture.nativeElement.querySelector('.route-pin-badge') as HTMLElement;
    expect(badge.querySelector('img')).toBeNull();
    expect(badge.textContent).toContain('<img onerror=');
  });

  it('accepts route data', () => {
    fixture.componentRef.setInput('data', {
      lines: [{ kind: 'recorded', points: [[19.07, 72.88], [19.08, 72.89]] }],
      markers: [{ id: 'a', latitude: 19.07, longitude: 72.88, tone: 'primary', tooltip: 'Start' }],
    });
    fixture.detectChanges();
    expect(component.data().lines.length).toBe(1);
  });
});
