import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account and sends a verification OTP to the provided email',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully. OTP sent to email.',
    example: {
      message: 'Registration successful. Please verify your email.',
      data: {
        id: 'uuid',
        email: 'user@example.com',
        emailVerified: false,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or user already exists',
  })
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto.email, dto.password);
    return {
      message: 'Registration successful. Please verify your email.',
      data: user,
    };
  }

  @Public()
  @Post('verify-account')
  @ApiOperation({
    summary: 'Verify user account with OTP',
    description:
      'Activates the user account after email verification with the sent OTP',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 200,
    description: 'Account verified successfully',
    example: {
      message: 'Account verified successfully',
      data: {
        id: 'uuid',
        email: 'user@example.com',
        emailVerified: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid OTP or OTP expired',
  })
  async verifyAccount(@Body() dto: VerifyOtpDto) {
    const result = await this.authService.verifyAccount(dto.email, dto.otp);
    return {
      message: 'Account verified successfully',
      data: result,
    };
  }

  @Public()
  @Post('resend-verification')
  @ApiOperation({
    summary: 'Resend verification OTP',
    description:
      'Sends a new OTP to the user email if the previous one has expired',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
        },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Verification OTP resent successfully',
    example: {
      message: 'Verification code sent to your email',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async resendVerification(@Body() body: { email: string }) {
    const result = await this.authService.resendVerification(body.email);
    return {
      message: result.message,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticates user with email and password. Returns JWT access token.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns access token.',
    example: {
      message: 'Login successful',
      data: {
        id: 'uuid',
        email: 'user@example.com',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 3600,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto.email, dto.password);
    return {
      message: 'Login successful',
      data: result,
    };
  }
}
