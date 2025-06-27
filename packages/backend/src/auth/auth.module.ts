import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard'; // Import the guard

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.register({
			secret: 'aVeryHardToGuessSecret',
			signOptions: { expiresIn: '7d' },
		}),
	],
	providers: [AuthService, JwtStrategy, JwtAuthGuard], // Add the guard to providers
	controllers: [AuthController],
	exports: [JwtAuthGuard], // Export the guard so it can be used globally
})
export class AuthModule {}
