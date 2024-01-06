import { HttpStatus, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseBody, SuccessResponseBody } from './types/response.model';
import { HttpService } from './services/http.service';
import { CacheService } from './services/cache.service';
import { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';
import { CACHE_REQUESTS } from './constants/cache-requests.constant';

@Injectable()
export class AppService {
  private readonly cacheRequests: string[] = CACHE_REQUESTS;

  constructor(
    private readonly httpService: HttpService,
    private readonly cacheService: CacheService,
  ) {}

  async redirect(
    recipient: string,
    { method, originalUrl, body, headers }: Request,
    response: Response<ErrorResponseBody | SuccessResponseBody>,
  ): Promise<void> {
    const recipientURL = process.env[recipient];

    if (!recipientURL) {
      this.sendErrorResponse(response, {
        status: HttpStatus.BAD_GATEWAY,
        message: `Cannot process request for recipient - ${recipient}`,
      });
      return;
    }

    const cacheKey = `${method}-${originalUrl}`;

    if (this.shouldBeCached(cacheKey)) {
      const cachedResponse = this.cacheService.get<AxiosResponse>(cacheKey);

      if (cachedResponse) {
        const { data, status } = cachedResponse;
        response.status(status).json({ data: data });
        return;
      }
    }

    const redirectUrl = `${recipientURL}${originalUrl}`;
    const redirectHeaders = headers.authorization
      ? new AxiosHeaders({ authorization: headers.authorization })
      : undefined;

    this.httpService
      .redirect(method, redirectUrl, body, redirectHeaders)
      .then((redirectResponse: AxiosResponse) => {
        const { data, status } = redirectResponse;
        response.status(status).json({ data });

        if (this.shouldBeCached(cacheKey)) {
          this.cacheService.set<AxiosResponse>(cacheKey, redirectResponse);
        }
      })
      .catch((error: Error | AxiosError) => {
        this.sendErrorResponse(response, error);
      });
  }

  private sendErrorResponse(
    response: Response,
    error: Error | AxiosError | { status: number; message: string },
  ): void {
    if ('response' in error) {
      const {
        response: { status, data },
      } = error;

      response.status(status).json({ data });
    }

    response
      .status(error['status'] ?? HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }

  private shouldBeCached(key: string): boolean {
    return this.cacheRequests.includes(key);
  }
}
