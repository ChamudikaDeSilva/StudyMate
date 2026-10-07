import {AuthUser} from '../domain/models/AuthUser';

export const getDisplayName = (user?: AuthUser | null): string => {
  const name = user?.name?.trim();
  if (name) {
    return name;
  }

  const emailName = user?.email?.split('@')[0]?.trim();
  if (!emailName) {
    return 'Student';
  }

  return emailName
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase());
};

export const getFirstName = (user?: AuthUser | null): string =>
  getDisplayName(user).split(' ')[0];
