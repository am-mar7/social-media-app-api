import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AuthType } from 'src/auth/enums/auth.enum';
import { AUTH_TYPE_KEY } from 'src/auth/constants/auth.constants';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;

  private readonly authGuardMap: Record<AuthType, CanActivate>;

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {
    this.authGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.None]: { canActivate: () => true },
    };
  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const authType = this.reflector.getAllAndOverride(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];

    console.log(authType)

    for (const type of authType) {
      const guard = this.authGuardMap[type];
      if (guard) {
        const canActivate = await guard.canActivate(context);
        if (canActivate) {
          return true;
        }
      }
    }

    throw new UnauthorizedException();
  }
}
