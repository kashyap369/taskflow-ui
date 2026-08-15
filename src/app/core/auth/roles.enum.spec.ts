import { canAccessPortal } from './roles.enum';

describe('canAccessPortal', () => {
  it('lets an Individual account use both personal and organization workspaces', () => {
    expect(canAccessPortal('member', 'member')).toBeTrue();
    expect(canAccessPortal('member', 'organization')).toBeTrue();
  });

  it('keeps organization accounts in the organization portal', () => {
    expect(canAccessPortal('organization', 'organization')).toBeTrue();
    expect(canAccessPortal('organization', 'member')).toBeFalse();
  });

  it('keeps administrators isolated in the admin portal', () => {
    expect(canAccessPortal('admin', 'admin')).toBeTrue();
    expect(canAccessPortal('admin', 'organization')).toBeFalse();
    expect(canAccessPortal('admin', 'member')).toBeFalse();
  });
});
