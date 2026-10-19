import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import * as L from 'leaflet';

/** How a line is drawn. `inferred` is a server guess across a gap and is always dashed. */
export type RouteLineKind = 'recorded' | 'unsnapped' | 'inferred' | 'pending';

/** Semantic colour of a marker; resolved from the theme tokens, never a literal. */
export type RouteMarkerTone = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'muted';

export interface RouteLine {
  kind: RouteLineKind;
  points: [number, number][];
  tooltip?: string;
}

export interface RouteMarker {
  id: string;
  latitude: number;
  longitude: number;
  tone: RouteMarkerTone;
  /** `xs` for one recorded fix, up through people at `lg`. */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  tooltip: string;
  /** Keep the tooltip open (e.g. a person's name on the live map). */
  permanentLabel?: string;
  /**
   * Short text on a badge over the pin, e.g. `IN` / `OUT`. Setting it turns the marker into a
   * round photo pin instead of a plain dot.
   */
  badge?: string;
  /**
   * A punch selfie, as an object URL fetched with the session's token — the photo endpoint is
   * authenticated, so a plain remote `src` cannot load it. Only used when `badge` is set; while
   * it is absent the pin shows the badge alone.
   */
  avatarUrl?: string;
}

export interface RouteMapData {
  lines: RouteLine[];
  markers: RouteMarker[];
}

const MARKER_RADIUS: Record<NonNullable<RouteMarker['size']>, number> = { xs: 3, sm: 5, md: 7, lg: 10 };
/** Must match `.route-pin` in route-map.scss, which is what actually sizes the photo pin. */
const PIN_SIZE = 38;

/**
 * A Leaflet map that draws tracked routes, stops and people. Tiles come from the configured
 * provider (`AppSettings.maps`); colours come from the theme tokens so it follows light/dark.
 * The map is a picture of data the page also lists as text — it is not the only way to read it.
 */
@Component({
  selector: 'app-route-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './route-map.html',
  styleUrl: './route-map.scss',
})
export class RouteMap {
  readonly data = input<RouteMapData>({ lines: [], markers: [] });
  readonly tileUrl = input.required<string>();
  readonly attribution = input<string>('');
  readonly ariaLabel = input<string>('Map');
  /** Changing this re-fits the view to the data; leave it alone to keep the user's pan and zoom. */
  readonly fitKey = input<string | number | null>(null);
  readonly markerSelected = output<string>();

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly container = viewChild.required<ElementRef<HTMLDivElement>>('container');
  private map: L.Map | null = null;
  private layer: L.LayerGroup | null = null;
  private lastFitKey: string | number | null | undefined = undefined;
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    afterNextRender(() => {
      const map = L.map(this.container().nativeElement, { zoomControl: true, attributionControl: true })
        // India until there is something to show.
        .setView([20.59, 78.96], 5);
      L.tileLayer(this.tileUrl(), { attribution: this.attribution(), maxZoom: 19 }).addTo(map);
      this.layer = L.layerGroup().addTo(map);
      this.map = map;
      this.draw();
    });

    effect(() => {
      // Read the inputs so the effect re-runs when they change.
      this.data();
      this.fitKey();
      if (this.map) this.draw();
    });

    inject(DestroyRef).onDestroy(() => {
      if (this.resizeTimer) clearTimeout(this.resizeTimer);
      this.map?.remove();
      this.map = null;
    });
  }

  private draw(): void {
    const map = this.map;
    const layer = this.layer;
    if (!map || !layer) return;
    layer.clearLayers();

    const data = this.data();
    const bounds = L.latLngBounds([]);

    for (const line of data.lines) {
      if (line.points.length < 2) continue;
      const polyline = L.polyline(line.points, this.lineStyle(line.kind));
      if (line.tooltip) polyline.bindTooltip(line.tooltip, { sticky: true });
      polyline.addTo(layer);
      line.points.forEach((p) => bounds.extend(p));
    }

    for (const marker of data.markers) {
      const drawn = marker.badge ? this.photoPin(marker) : this.dot(marker);
      if (marker.permanentLabel) {
        drawn.bindTooltip(marker.permanentLabel, { permanent: true, direction: 'top', offset: [0, -8] });
        drawn.bindPopup(marker.tooltip);
      } else {
        drawn.bindTooltip(marker.tooltip, { direction: 'top' });
      }
      drawn.on('click', () => this.markerSelected.emit(marker.id));
      drawn.addTo(layer);
      bounds.extend([marker.latitude, marker.longitude]);
    }

    const key = this.fitKey();
    if (bounds.isValid() && key !== this.lastFitKey) {
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 16 });
      this.lastFitKey = key;
    }
    // The container may have been laid out after Leaflet measured it (tabs, drawers).
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.resizeTimer = null;
      if (this.map === map) map.invalidateSize();
    }, 0);
  }

  private dot(marker: RouteMarker): L.CircleMarker {
    return L.circleMarker([marker.latitude, marker.longitude], {
      radius: MARKER_RADIUS[marker.size ?? 'md'],
      color: this.token('--surface'),
      weight: 2,
      fillColor: this.token(`--${marker.tone === 'muted' ? 'text-subtle' : marker.tone}`),
      fillOpacity: 1,
    });
  }

  /**
   * A round pin carrying the member's punch selfie and an IN/OUT badge. Built as a `divIcon` so the
   * photo and the badge are real elements the stylesheet themes with tokens — a `circleMarker` can
   * only be a filled circle. Everything interpolated is escaped: `avatarUrl` is an object URL this
   * app created, but it still passes through an HTML attribute.
   */
  private photoPin(marker: RouteMarker): L.Marker {
    const photo = marker.avatarUrl
      ? `<img class="route-pin-photo" src="${escapeHtml(marker.avatarUrl)}" alt="" />`
      : '<span class="route-pin-photo is-empty" aria-hidden="true"></span>';
    return L.marker([marker.latitude, marker.longitude], {
      keyboard: false,
      icon: L.divIcon({
        className: 'route-pin-icon',
        iconSize: [PIN_SIZE, PIN_SIZE],
        iconAnchor: [PIN_SIZE / 2, PIN_SIZE / 2],
        html:
          `<span class="route-pin" data-tone="${escapeHtml(marker.tone)}">${photo}` +
          `<span class="route-pin-badge">${escapeHtml(marker.badge ?? '')}</span></span>`,
      }),
    });
  }

  private lineStyle(kind: RouteLineKind): L.PolylineOptions {
    switch (kind) {
      case 'recorded':
        return { color: this.token('--primary'), weight: 5, opacity: 0.9 };
      case 'unsnapped':
        return { color: this.token('--primary'), weight: 3, opacity: 0.6 };
      case 'inferred':
        return { color: this.token('--text-subtle'), weight: 4, opacity: 0.9, dashArray: '8 8' };
      case 'pending':
        return { color: this.token('--info'), weight: 3, opacity: 0.7, dashArray: '2 6' };
    }
  }

  private token(name: string): string {
    return getComputedStyle(this.host.nativeElement).getPropertyValue(name).trim() || 'currentColor';
  }
}

function escapeHtml(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}
