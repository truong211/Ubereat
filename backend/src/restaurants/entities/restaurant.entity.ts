import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('restaurants')
@Index(['isActive'])
@Index(['ownerId'])
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'ownerId' })
  ownerId: string;

  @Column({ type: 'json' })
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'text', array: true, nullable: true })
  cuisineType: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  rating: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  minOrderAmount: number;

  @Column({ type: 'int', default: 30 })
  deliveryTimeMin: number;

  @Column({ type: 'int', default: 45 })
  deliveryTimeMax: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isOpen: boolean;

  @Column({ type: 'json', nullable: true })
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      isClosed: boolean;
    };
  };

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  bannerUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  // Note: Uncomment these when you create the related entities
  // @OneToMany(() => MenuCategory, category => category.restaurant)
  // menuCategories: MenuCategory[];

  // @OneToMany(() => MenuItem, item => item.restaurant)
  // menuItems: MenuItem[];

  // @OneToMany(() => Order, order => order.restaurant)
  // orders: Order[];

  // @OneToMany(() => Review, review => review.restaurant)
  // reviews: Review[];
}
