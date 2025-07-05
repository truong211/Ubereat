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
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { MenuCategory } from './menu-category.entity';

@Entity('menu_items')
@Index(['restaurantId'])
@Index(['categoryId'])
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'restaurantId' })
  restaurantId: string;

  @Column({ name: 'categoryId', nullable: true })
  categoryId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ default: false })
  isVegetarian: boolean;

  @Column({ default: false })
  isVegan: boolean;

  @Column({ default: false })
  isGlutenFree: boolean;

  @Column({ type: 'text', array: true, nullable: true })
  allergens: string[];

  @Column({ type: 'text', array: true, nullable: true })
  ingredients: string[];

  @Column({ type: 'int', nullable: true })
  calories: number;

  @Column({ type: 'int', default: 15 })
  preparationTime: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;

  @ManyToOne(() => MenuCategory, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: MenuCategory;

  // Note: Uncomment when OrderItem entity is created
  // @OneToMany(() => OrderItem, item => item.menuItem)
  // orderItems: OrderItem[];
}
