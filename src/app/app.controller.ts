import { Controller, Get } from '@nestjs/common';
import pack from '../../package.json';

@Controller()
export class AppController {
  @Get()
  get(): string {
    return `Bomberman API version: ${pack && pack.version}`;
  }
}
