import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { users } from '@pain-prism/scraper/db/schema';
import { eq } from 'drizzle-orm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly db: DrizzleService) {}

  async create(createUserDto: CreateUserDto) {
    const [newUser] = await this.db.db
      .insert(users)
      .values({
        email: createUserDto.email,
        passwordHash: createUserDto.password,
        subscriptionStatus: 'free', // All new users start as free
      })
      .returning();
    return newUser;
  }

  async findOne(email: string) {
    return await this.db.db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }
}