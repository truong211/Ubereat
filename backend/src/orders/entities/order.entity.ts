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
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@Entity('orders')
@Index(['customerId'])
@Index(['restaurantId'])
@Index(['driverId'])
@Index(['status'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customerId' })
  customerId: string;

  @Column({ name: 'restaurantId' })
  restaurantId: string;

  @Column({ name: 'driverId', nullable: true })
  driverId: string;

  @Column({ length: 50, unique: true })
  orderNumber: string;

  @Column({ length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  tipAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ length: 50, nullable: true })
  paymentMethod: string;

  @Column({ length: 50, default: 'pending' })
  paymentStatus: string;

  @Column({ type: 'json' })
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };

  @Column({ type: 'text', nullable: true })
  specialInstructions: string;

  @Column({ type: 'timestamp', nullable: true })
  estimatedDeliveryTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualDeliveryTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'driverId' })
  driver: User;

  // Note: Uncomment when OrderItem and Review entities are created
  // @OneToMany(() => OrderItem, item => item.order)
  // orderItems: OrderItem[];

  // @OneToMany(() => Review, review => review.order)
  // reviews: Review[];
}
