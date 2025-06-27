import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
	// Override the default handleRequest method.
	// The default method throws an error if 'user' is null.
	// This version will simply return the user, or null, without throwing.
	handleRequest(err, user, info, context) {
		return user;
	}
}
