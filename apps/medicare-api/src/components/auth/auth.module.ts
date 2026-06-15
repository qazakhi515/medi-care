import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [
		HttpModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				secret: config.get<string>('SECRET_TOKEN'),
				signOptions: { expiresIn: '30d' },
			}),
		}),
	],
	providers: [AuthService],
	exports: [AuthService],
})
export class AuthModule {}
