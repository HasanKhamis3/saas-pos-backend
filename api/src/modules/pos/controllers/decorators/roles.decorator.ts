import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../entities/user.entity';

export const ROLES_KEY = 'roles';
// هذه الدالة تسمح لنا بتحديد من المسموح له بالدخول (مثلاً: Roles(UserRole.MANAGER))
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);