import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableCors({
		origin: process.env.FRONTEND_HOST, // The origin of our frontend
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		credentials: true, // Allow cookies/authorization headers
	});

	// It's good practice to get the port from environment variables
	const port = process.env.PORT || 3000;

	await app.listen(port);
	console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
