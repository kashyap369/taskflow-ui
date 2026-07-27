import { TestBed } from '@angular/core/testing';

import { AccountType } from './roles.enum';
import { User } from '../models/user.model';
import { TokenService } from './token.service';

const USER: User = {
  id: 3,
  fullName: 'Nadia Owens',
  email: 'nadia.owens+org1@taskflow.test',
  roles: ['User'],
  accountType: AccountType.Organization,
};

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('persists to localStorage when "remember me" is on', () => {
    service.setTokens('access-1', 'refresh-1', true);

    expect(localStorage.getItem('access_token')).toBe('access-1');
    expect(sessionStorage.getItem('access_token')).toBeNull();
  });

  it('persists to sessionStorage when "remember me" is off, so the session is tab-scoped', () => {
    service.setTokens('access-1', 'refresh-1', false);

    expect(sessionStorage.getItem('access_token')).toBe('access-1');
    expect(localStorage.getItem('access_token')).toBeNull();
  });

  /**
   * Both stores are visible to every tab on the origin. A remember-me sign-in in another tab writes
   * `localStorage`; this tab's own `sessionStorage` session must still win, or the tab would silently
   * start acting as whoever signed in elsewhere.
   */
  it('prefers this tab’s sessionStorage session over a localStorage one from another tab', () => {
    // This tab signed in without remember-me.
    service.setTokens('this-tab', 'this-tab-refresh', false);
    // Another tab then signed in with remember-me, writing the shared store directly.
    localStorage.setItem('access_token', 'other-tab');
    localStorage.setItem('refresh_token', 'other-tab-refresh');

    expect(service.getToken()).toBe('this-tab');
    expect(service.getRefreshToken()).toBe('this-tab-refresh');
  });

  it('falls back to localStorage when this tab has no session of its own', () => {
    localStorage.setItem('access_token', 'remembered');

    expect(service.getToken()).toBe('remembered');
  });

  it('writes the principal and rotated tokens into the store holding this tab’s session', () => {
    service.setTokens('this-tab', 'this-tab-refresh', false);
    localStorage.setItem('access_token', 'other-tab');

    service.setUser(USER);
    service.updateTokens('rotated', 'rotated-refresh');

    // Everything landed in sessionStorage — the other tab's persistent session is untouched.
    expect(sessionStorage.getItem('auth_user')).toContain('Nadia Owens');
    expect(sessionStorage.getItem('access_token')).toBe('rotated');
    expect(localStorage.getItem('auth_user')).toBeNull();
    expect(localStorage.getItem('access_token')).toBe('other-tab');
  });

  it('clears both stores on sign-out', () => {
    service.setTokens('a', 'b', true);
    service.setUser(USER);
    sessionStorage.setItem('access_token', 'stray');

    service.clearSession();

    expect(service.getToken()).toBeNull();
    expect(service.getUser()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });
});
