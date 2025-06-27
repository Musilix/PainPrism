import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: 'aVeryHardToGuessSecret',
		});
	}

	async validate(payload: any) {
		// This payload is the decoded JWT. We can trust it.
		return {
			userId: payload.sub,
			email: payload.email,
			status: payload.status,
		};
	}
}
