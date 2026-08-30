import { TestBed } from '@angular/core/testing';

import { MeetingRoomService } from './meeting-room.service';

describe('MeetingRoomService', () => {
  it('starts disconnected and cleanup remains idempotent before a room exists', async () => {
    const service = TestBed.inject(MeetingRoomService);

    await service.disconnect();
    await service.disconnect();

    expect(service.connectionState()).toBe('disconnected');
    expect(service.participantCount()).toBe(0);
    expect(service.microphoneEnabled()).toBeFalse();
    expect(service.cameraEnabled()).toBeFalse();
    expect(service.screenShareEnabled()).toBeFalse();
  });
});
