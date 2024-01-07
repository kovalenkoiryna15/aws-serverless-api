import { All, Controller, Param, Res, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Response, Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @All(':recipient*')
  async handleRequest(
    @Param('recipient') recipient: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    return this.appService.redirect(recipient, req, res);
  }
}
