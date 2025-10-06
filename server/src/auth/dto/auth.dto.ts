import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({ description: 'The ID token from Google' })
  @IsString()
  idToken: string;
}

export class ZkpRegisterDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'ZKP commitment (hash of secret)' })
  @IsString()
  commitment: string;

  @ApiProperty({ description: 'Public key for verification', required: false })
  @IsString()
  @IsOptional()
  publicKey?: string;

  @ApiProperty({ description: 'User name', required: false })
  @IsString()
  @IsOptional()
  name?: string;
}

export class ZkpLoginDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'ZKP proof object as JSON string' })
  @IsString()
  proof: string;

  @ApiProperty({ description: 'Public signals as JSON string' })
  @IsString()
  publicSignals: string;
}
