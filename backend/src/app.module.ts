import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EquipmentModule } from './modules/equipment.module';
import { RequestModule } from './modules/request.module';

@Module({
  imports: [EquipmentModule, RequestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
