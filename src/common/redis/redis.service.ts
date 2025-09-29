import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { LoggerService } from '../services';

const prefixKey = {
  OTP_REQUEST_RATE: 'otp_request_rate',
  OTP_VALIDATION_RATE: 'otp_validation_rate',
};

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
    prefix: string,
  ): Promise<number> {
    const key = `${prefix}:${phoneNumber}:${type}:${channel}`;
    const count = await this.redis.get(key);

    this.logger.log(`Get counter for key: ${key}`, RedisService.name);

    return count ? parseInt(count, 10) : 0;
  }

  async incrementOtpCounter(
    phoneNumber: string,
    type: string,
    channel: string,
    ttlSec: number,
    prefix: string,
  ) {
    const key = `${prefix}:${phoneNumber}:${type}:${channel}`;
    const count = await this.redis.get(key);

    this.logger.log(`Increase counter for key: ${key}`, RedisService.name);

    if (!count) {
      await this.redis.set(key, 1, 'EX', ttlSec);
      return 1;
    } else {
      return await this.redis.incr(key);
    }
  }

  async getRequestOtpCounter(
    phoneNumber: string,
    type: string,
    channel: string,
  ): Promise<number> {
    return await this.getOtpCounter(
      phoneNumber,
      type,
      channel,
      prefixKey.OTP_REQUEST_RATE,
    );
  }

  async incrementRequestOtpCounter(
    phoneNumber: string,
    type: string,
    channel: string,
    ttlSec = 1800,
  ) {
    return this.incrementOtpCounter(
      phoneNumber,
      type,
      channel,
      ttlSec,
      prefixKey.OTP_REQUEST_RATE,
    );
  }
  s;

  async getValidationOtpCounter(
    phoneNumber: string,
    type: string,
    channel: string,
  ): Promise<number> {
    return await this.getOtpCounter(
      phoneNumber,
      type,
      channel,
      prefixKey.OTP_VALIDATION_RATE,
    );
  }

  async incrementValidationOtpCounter(
    phoneNumber: string,
    type: string,
    channel: string,
    ttlSec = 1800,
  ) {
    return this.incrementOtpCounter(
      phoneNumber,
      type,
      channel,
      ttlSec,
      prefixKey.OTP_VALIDATION_RATE,
    );
  }
}
