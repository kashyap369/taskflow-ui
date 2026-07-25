import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@core/api/api.service';
import { API } from '@core/api/api-endpoints';
import { OrganizationInvitation } from '@shared/models/invitation.model';

/**
 * Data layer for the Member (Individual) portal. Like the rest of the API outside Auth, these
 * endpoints return raw values (no `ApiResponse<T>` envelope).
 */
@Injectable({ providedIn: 'root' })
export class MemberRepository {
  private readonly api = inject(ApiService);

  /**
   * `GET /organizationinvitation/mine` → OrganizationInvitationDto[]. The API matches on the
   * **current user's email** and only ever returns **Pending** invitations.
   */
  getMyInvitations(): Observable<OrganizationInvitation[]> {
    return this.api.get<OrganizationInvitation[]>(API.Invitation.Mine);
  }

  /** `POST /organizationinvitation/accept` (204). Creates the membership server-side. */
  acceptInvitation(invitationId: number): Observable<void> {
    return this.api.post<void>(API.Invitation.Accept, { invitationId });
  }

  /** `POST /organizationinvitation/reject` (204). */
  rejectInvitation(invitationId: number): Observable<void> {
    return this.api.post<void>(API.Invitation.Reject, { invitationId });
  }
}
