import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EquipmentModule } from './modules/equipment.module';

@Module({
  imports: [EquipmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
