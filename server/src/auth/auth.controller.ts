import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { GoogleAuthDto, ZkpRegisterDto, ZkpLoginDto } from './dto/auth.dto';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  @Public()
  async googleAuth(@Body() body: GoogleAuthDto) {
    return this.authService.handleGoogleAuth(body.idToken);
  }

  // ZKP Authentication Endpoints

  @Post('zkp/register')
  @Public()
  async zkpRegister(@Body() body: ZkpRegisterDto) {
    return this.authService.zkpRegister(body);
  }

  @Post('zkp/login')
  @Public()
  async zkpLogin(@Body() body: ZkpLoginDto) {
    return this.authService.zkpLogin(body);
  }

  @Get('zkp/status')
  @Public()
  async zkpStatus(@Query('email') email: string) {
    return this.authService.getZkpStatus(email);
  }
}
