import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClustersService } from './clusters.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('clusters')
@UseGuards(JwtAuthGuard, RolesGuard) // Protect all routes in this controller
export class ClustersController {
  constructor(private readonly clustersService: ClustersService) {}

  @Get()
  @Roles(Role.Pro) // Only users with the 'pro' role can access this
  findAll() {
    return this.clustersService.findAll();
  }
}