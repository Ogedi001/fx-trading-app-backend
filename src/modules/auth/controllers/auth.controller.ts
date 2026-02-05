import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { RegisterSchema, type RegisterDto } from '../dto/register.dto';
import { LoginSchema, type LoginDto } from '../dto/login.dto';
import { type VerifyOtpDto, VerifyOtpSchema } from '../dto/verify-otp.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto.email, dto.password);
    return {
      message: 'Registration successful. Please verify your email.',
      data: user,
    };
  }

  @Public()
  @Post('verify-account')
  @UsePipes(new ZodValidationPipe(VerifyOtpSchema))
  async verifyAccount(@Body() dto: VerifyOtpDto) {
    const result = await this.authService.verifyAccount(dto.email, dto.otp);
    return {
      message: 'Account verified successfully',
      data: result,
    };
  }

  @Public()
  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    const result = await this.authService.resendVerification(body.email);
    return {
      message: result.message,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto.email, dto.password);
    return {
      message: 'Login successful',
      data: result,
    };
  }
}
