import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'khach.hang@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'MatKhau@123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @MaxLength(150)
  fullName!: string;

  @ApiProperty({ required: false, example: '0900000000' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiProperty({ enum: ['CUSTOMER', 'WORKER'] })
  @IsIn(['CUSTOMER', 'WORKER'])
  role!: 'CUSTOMER' | 'WORKER';

  @ApiProperty({
    required: false,
    enum: ['INDIVIDUAL', 'BUSINESS'],
    description: 'Bắt buộc khi role = CUSTOMER',
  })
  @IsOptional()
  @IsIn(['INDIVIDUAL', 'BUSINESS'])
  customerType?: string;

  @ApiProperty({
    required: false,
    description:
      'Tên hiển thị của khách hàng, bắt buộc khi role = CUSTOMER',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  displayName?: string;
}
