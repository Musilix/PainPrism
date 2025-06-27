import {
	Controller,
	Post,
	Body,
	Get,
	UseGuards,
	Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	async login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto);
	}

	@Post('register')
	async register(@Body() createUserDto: CreateUserDto) {
		return this.authService.register(createUserDto);
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Request() req) {
		// req.user is populated by the JwtAuthGuard
		return req.user;
	}
}
