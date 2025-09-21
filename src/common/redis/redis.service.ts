import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { LoggerService } from '../services';

@Injectable()
export class RedisService {
  constructor(
    private readonly logger: LoggerService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async getOtpCounter(
    phoneNumber: string,
    type: string,
    channel: string,
  ): Promise<number> {
    const key = `otp_rate:${phoneNumber}:${type}:${channel}`;
    const count = await this.redis.get(key);

    this.logger.log(`Get counter for key: ${key}`, RedisService.name);

    return count ? parseInt(count, 10) : 0;
  }

  async incrementOtpCounter(
    phoneNumber: string,
    type: string,
    channel: string,
    ttlSec = 900,
  ) {
    const key = `otp_rate:${phoneNumber}:${type}:${channel}`;
    const count = await this.redis.get(key);

    this.logger.log(`Increase counter for key: ${key}`, RedisService.name);

    if (!count) {
      await this.redis.set(key, 1, 'EX', ttlSec);
      return 1;
    } else {
      return await this.redis.incr(key);
    }
  }
}
