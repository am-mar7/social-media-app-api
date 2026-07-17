import { Injectable } from "@nestjs/common";


@Injectable()
export abstract class HashingProvider {
  abstract hash(password: string | Buffer): Promise<string>;
  abstract compare(password: string | Buffer, hash: string): Promise<boolean>;
}
