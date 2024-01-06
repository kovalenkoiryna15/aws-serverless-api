import { HttpStatus, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseBody, SuccessResponseBody } from './types/response.model';
import { HttpService } from './http.service';
import { AxiosError, AxiosResponse } from 'axios';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  async redirect(
    recipient: string,
    { method, originalUrl, body }: Request,
    response: Response<ErrorResponseBody | SuccessResponseBody>,
  ): Promise<void> {
    const recipientURL = process.env[recipient];

    if (!recipientURL) {
      response
        .status(HttpStatus.BAD_GATEWAY)
        .json({ error: `Cannot process request for recipient - ${recipient}` });
      return;
    }

    this.httpService
      .redirect(method, `${recipientURL}${originalUrl}`, body)
      .then(({ data }: AxiosResponse) => {
        response.json({ data });
      })
      .catch((error: Error | AxiosError) => {
        if (!error['response']) {
          response
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ error: error.message });
        }

        const {
          response: { status, data },
        } = error as AxiosError;

        response.status(status).json({ data });
      });
  }
}
