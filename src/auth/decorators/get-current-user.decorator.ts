import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  sessionId: string;
}

interface RequestWithUser extends Request {
  user?: JwtPayload;
}

export const GetCurrentUser = createParamDecorator<
  keyof JwtPayload | undefined
>((data: string | undefined, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<RequestWithUser>();
  const user = request.user;

  if (!user) {
    return undefined;
  }

  if (!data) {
    return user;
  }

  return user[data as keyof JwtPayload];
});
