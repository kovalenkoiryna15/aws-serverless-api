import { Injectable } from '@nestjs/common';
import axios, { AxiosHeaders, AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class HttpService {
  async redirect<D = unknown>(
    method: string,
    url: string,
    body?: D,
    headers?: AxiosHeaders,
  ): Promise<AxiosResponse<unknown, D>> {
    const config: AxiosRequestConfig<D> = {
      method,
      url,
    };

    if (Object.keys(body).length) {
      config.data = body;
    }

    if (Object.keys(headers).length) {
      config.headers = headers;
    }

    return axios(config);
  }
}
