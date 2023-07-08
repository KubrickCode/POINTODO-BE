import { Provider, Role } from '@prisma/client';

interface DecodedToken {
  id: string;
  email: string;
  provider: Provider;
  role: Role;
  defaultBadgeId: number;
  createdAt: Date;
  iat?: number;
  exp?: number;
}

export { DecodedToken };
