import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
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

  @Get('pending')
  getPending() {
    return this.requestService.getPending();
  }
  @Get('history')
  getHistory() {
    return this.requestService.getHistory();
  }
  @Patch(':id/approve')
  approve(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    return this.requestService.approve(req.user, id);
  }

  @Patch(':id/reject')
  reject(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    return this.requestService.reject(req.user, id);
  }
}
