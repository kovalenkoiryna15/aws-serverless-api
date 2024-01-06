import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpService } from './http.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, HttpService],
})
export class AppModule {}
