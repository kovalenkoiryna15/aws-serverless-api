import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class HttpService {
  async redirect<D = unknown>(
    method: string,
    url: string,
    body?: D,
  ): Promise<AxiosResponse<unknown, D>> {
    const config: AxiosRequestConfig<D> = {
      method,
      url,
    };

    if (Object.keys(body).length) {
      config.data = body;
    }

    return axios(config);
  }
}
