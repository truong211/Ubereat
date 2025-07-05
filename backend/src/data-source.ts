import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { User } from './users/entities/user.entity';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { MenuCategory } from './menus/entities/menu-category.entity';
import { MenuItem } from './menus/entities/menu-item.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { Review } from './reviews/entities/review.entity';

config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url:
    configService.get<string>('DATABASE_URL') ||
    'postgresql://postgres:password@localhost:5432/ubereats',
  entities: [
    User,
    Restaurant,
    MenuCategory,
    MenuItem,
    Order,
    OrderItem,
    Review,
  ],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: configService.get<string>('NODE_ENV') === 'development',
  ssl:
    configService.get<string>('NODE_ENV') === 'production'
      ? { rejectUnauthorized: false }
      : false,
});
