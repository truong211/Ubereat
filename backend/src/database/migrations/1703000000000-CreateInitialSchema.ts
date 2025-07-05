import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1703000000000 implements MigrationInterface {
  name = 'CreateInitialSchema1703000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create enum types
    await queryRunner.query(
      `CREATE TYPE "user_role" AS ENUM('customer', 'restaurant_owner', 'driver', 'admin')`,
    );

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "phone" character varying,
        "role" "user_role" NOT NULL DEFAULT 'customer',
        "isActive" boolean NOT NULL DEFAULT true,
        "emailVerified" boolean NOT NULL DEFAULT false,
        "refreshToken" text,
        "resetPasswordToken" text,
        "resetPasswordExpires" TIMESTAMP,
        "emailVerificationToken" character varying,
        "emailVerificationExpires" TIMESTAMP,
        "profileImage" character varying,
        "dateOfBirth" date,
        "address" json,
        "preferences" json,
        "lastLoginAt" TIMESTAMP,
        "lastActivityAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for users table
    await queryRunner.query(
      `CREATE INDEX "IDX_users_email" ON "users" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_role" ON "users" ("role")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_active" ON "users" ("isActive")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_created_at" ON "users" ("createdAt")`,
    );

    // Create restaurants table
    await queryRunner.query(`
      CREATE TABLE "restaurants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "description" text,
        "ownerId" uuid NOT NULL,
        "address" json NOT NULL,
        "phone" character varying(20),
        "email" character varying(255),
        "cuisineType" text array,
        "rating" decimal(3,2) DEFAULT '0.0',
        "deliveryFee" decimal(10,2) DEFAULT '0.0',
        "minOrderAmount" decimal(10,2) DEFAULT '0.0',
        "deliveryTimeMin" integer DEFAULT '30',
        "deliveryTimeMax" integer DEFAULT '45',
        "isActive" boolean NOT NULL DEFAULT true,
        "isOpen" boolean NOT NULL DEFAULT false,
        "operatingHours" json,
        "imageUrl" text,
        "bannerUrl" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_restaurants_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_restaurants_owner" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create menu categories table
    await queryRunner.query(`
      CREATE TABLE "menu_categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "restaurantId" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "sortOrder" integer DEFAULT '0',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_menu_categories_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_menu_categories_restaurant" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE
      )
    `);

    // Create menu items table
    await queryRunner.query(`
      CREATE TABLE "menu_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "restaurantId" uuid NOT NULL,
        "categoryId" uuid,
        "name" character varying(255) NOT NULL,
        "description" text,
        "price" decimal(10,2) NOT NULL,
        "imageUrl" text,
        "isVegetarian" boolean NOT NULL DEFAULT false,
        "isVegan" boolean NOT NULL DEFAULT false,
        "isGlutenFree" boolean NOT NULL DEFAULT false,
        "allergens" text array,
        "ingredients" text array,
        "calories" integer,
        "preparationTime" integer DEFAULT '15',
        "isAvailable" boolean NOT NULL DEFAULT true,
        "sortOrder" integer DEFAULT '0',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_menu_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_menu_items_restaurant" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_menu_items_category" FOREIGN KEY ("categoryId") REFERENCES "menu_categories"("id") ON DELETE SET NULL
      )
    `);

    // Create orders table
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "customerId" uuid NOT NULL,
        "restaurantId" uuid NOT NULL,
        "driverId" uuid,
        "orderNumber" character varying(50) NOT NULL,
        "status" character varying(50) DEFAULT 'pending',
        "subtotal" decimal(10,2) NOT NULL,
        "taxAmount" decimal(10,2) DEFAULT '0.0',
        "deliveryFee" decimal(10,2) DEFAULT '0.0',
        "tipAmount" decimal(10,2) DEFAULT '0.0',
        "totalAmount" decimal(10,2) NOT NULL,
        "paymentMethod" character varying(50),
        "paymentStatus" character varying(50) DEFAULT 'pending',
        "deliveryAddress" json NOT NULL,
        "specialInstructions" text,
        "estimatedDeliveryTime" TIMESTAMP,
        "actualDeliveryTime" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_orders_number" UNIQUE ("orderNumber"),
        CONSTRAINT "PK_orders_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_orders_customer" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_orders_restaurant" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_orders_driver" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create order items table
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "orderId" uuid NOT NULL,
        "menuItemId" uuid NOT NULL,
        "quantity" integer NOT NULL DEFAULT '1',
        "unitPrice" decimal(10,2) NOT NULL,
        "totalPrice" decimal(10,2) NOT NULL,
        "specialInstructions" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_order_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_order_items_menu_item" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE CASCADE
      )
    `);

    // Create reviews table
    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "customerId" uuid NOT NULL,
        "restaurantId" uuid NOT NULL,
        "orderId" uuid NOT NULL,
        "rating" integer NOT NULL,
        "comment" text,
        "isAnonymous" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_reviews_rating" CHECK ("rating" >= 1 AND "rating" <= 5),
        CONSTRAINT "PK_reviews_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reviews_customer" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reviews_restaurant" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reviews_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);

    // Create additional indexes for performance
    await queryRunner.query(
      `CREATE INDEX "IDX_restaurants_owner" ON "restaurants" ("ownerId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_restaurants_active" ON "restaurants" ("isActive")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_menu_items_restaurant" ON "menu_items" ("restaurantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_menu_items_category" ON "menu_items" ("categoryId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_customer" ON "orders" ("customerId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_restaurant" ON "orders" ("restaurantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_driver" ON "orders" ("driverId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_status" ON "orders" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_order_items_order" ON "order_items" ("orderId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reviews_restaurant" ON "reviews" ("restaurantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reviews_customer" ON "reviews" ("customerId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_reviews_customer"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_restaurant"`);
    await queryRunner.query(`DROP INDEX "IDX_order_items_order"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_status"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_driver"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_restaurant"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_customer"`);
    await queryRunner.query(`DROP INDEX "IDX_menu_items_category"`);
    await queryRunner.query(`DROP INDEX "IDX_menu_items_restaurant"`);
    await queryRunner.query(`DROP INDEX "IDX_restaurants_active"`);
    await queryRunner.query(`DROP INDEX "IDX_restaurants_owner"`);
    await queryRunner.query(`DROP INDEX "IDX_users_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_users_active"`);
    await queryRunner.query(`DROP INDEX "IDX_users_role"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "reviews"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "menu_items"`);
    await queryRunner.query(`DROP TABLE "menu_categories"`);
    await queryRunner.query(`DROP TABLE "restaurants"`);
    await queryRunner.query(`DROP TABLE "users"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "user_role"`);
  }
}
