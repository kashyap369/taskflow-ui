import type { Meta, StoryObj } from '@storybook/angular';

import { RouteMap, RouteMapData } from './route-map';

const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution = '&copy; OpenStreetMap contributors';

const day: RouteMapData = {
  lines: [
    { kind: 'recorded', points: [[19.2047, 72.8487], [19.1972, 72.8467], [19.1867, 72.8486]], tooltip: 'Matched to roads' },
    { kind: 'inferred', points: [[19.1867, 72.8486], [19.1726, 72.8414]], tooltip: 'Gap — route guessed' },
    { kind: 'pending', points: [[19.1726, 72.8414], [19.1650, 72.8420]], tooltip: 'Not yet matched' },
  ],
  markers: [
    { id: 'in', latitude: 19.2047, longitude: 72.8487, tone: 'success', size: 'sm', tooltip: 'Punched in 09:12' },
    { id: 'stop', latitude: 19.1867, longitude: 72.8486, tone: 'warning', tooltip: 'Stop · 24 min' },
    { id: 'now', latitude: 19.165, longitude: 72.842, tone: 'primary', size: 'lg', tooltip: 'Last seen 2 min ago', permanentLabel: 'Asha' },
  ],
};

const meta: Meta<RouteMap> = {
  title: 'Organisms/RouteMap',
  component: RouteMap,
  argTypes: {
    ariaLabel: { control: 'text' },
    fitKey: { control: 'text' },
  },
  args: { tileUrl, attribution, ariaLabel: 'Route map' },
  render: (args) => ({
    props: args,
    template: `<div style="height: 420px"><app-route-map [data]="data" [tileUrl]="tileUrl" [attribution]="attribution" [ariaLabel]="ariaLabel" [fitKey]="fitKey" /></div>`,
  }),
};

export default meta;
type Story = StoryObj<RouteMap>;

export const Empty: Story = { args: { data: { lines: [], markers: [] } } };

export const DayRoute: Story = { args: { data: day, fitKey: 'day' } };

export const LivePeople: Story = {
  args: {
    fitKey: 'live',
    data: {
      lines: [],
      markers: [
        { id: '1', latitude: 19.07, longitude: 72.88, tone: 'primary', size: 'lg', tooltip: 'Battery 64%', permanentLabel: 'Asha' },
        { id: '2', latitude: 19.11, longitude: 72.86, tone: 'warning', size: 'lg', tooltip: 'Battery 12%', permanentLabel: 'Ravi' },
      ],
    },
  },
};
