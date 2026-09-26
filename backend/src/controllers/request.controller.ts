import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { RequestService } from '../services/request.service';
import type { CreateRequestBody } from '../services/request.service';
import { UserGuard } from '../middlewares/user.guard';
import type { RequestWithUser } from '../middlewares/user.guard';

@Controller('requests')
@UseGuards(UserGuard)
export class RequestController {
  constructor(private requestService: RequestService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() body: CreateRequestBody) {
    return this.requestService.create(req.user, body);
  }
}
