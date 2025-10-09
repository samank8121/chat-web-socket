import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';

@Injectable()
export class BlacklistThrottlerGuard extends ThrottlerGuard {
  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const { context, limit, ttl } = requestProps;
    console.log('context, limit, ttl', limit, ttl);
    const client = context.switchToHttp().getRequest();
    const ip = client.ip;
    const key = this.generateKey(context, ip, 'default');
    const blacklistKey = `blacklist:${ip}`;
    const blacklistTtl = 86400; // 24 hours in seconds
    const blockDuration = blacklistTtl;
    const throttlerName = 'default';
    console.log(`IP ${ip} is making a request with key ${key}`);
    const storage = this.storageService as ThrottlerStorageRedisService;
    const redisKey = `{${key}:default}:hits`;

    // Check if user is blacklisted
    const isBlacklisted = await storage.redis.get(blacklistKey);
    console.log('blacklistKey', blacklistKey);
    if (isBlacklisted) {
      console.log(`IP ${ip} is currently blacklisted.`);
      const remainingTtl = await storage.redis.ttl(blacklistKey);
      throw new HttpException(
        `You are blocked due to excessive requests. Try again in ${Math.ceil(remainingTtl)} seconds.`,
        HttpStatus.FORBIDDEN,
      );
    }

    // Fetch hit count before increment
    const hitCountRaw = await storage.redis.get(redisKey);
    const totalHits = hitCountRaw ? parseInt(hitCountRaw, 10) : 0;

    if (totalHits >= limit) {
      await storage.redis.setex(blacklistKey, blacklistTtl, 'blacklisted');

      throw new HttpException(
        `Too many requests. You have been blacklisted for ${blacklistTtl} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment the request counter
    await storage.increment(key, ttl, limit, blockDuration, throttlerName);

    // // Fetch hit count after increment to confirm
    // const hitCountAfter = await storage.redis.get(redisKey);
    // console.log('hitCountRaw after increment:', hitCountAfter);
    // console.log(
    //   `IP ${ip} will make ${hitCountAfter ? parseInt(hitCountAfter, 10) : 1} requests.`,
    // );

    return true;
  }
}
