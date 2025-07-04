import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1703001000000 implements MigrationInterface {
  name = 'CreateInitialSchema1703001000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create enum types
    await queryRunner.query(`CREATE TYPE "user_role" AS ENUM('customer', 'restaurant_owner', 'driver', 'admin')`);

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
        "refreshToken" character varying,
        "resetPasswordToken" character varying,
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

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be3" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "users" ("role")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_active" ON "users" ("isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_created_at" ON "users" ("createdAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_users_active"`);
    await queryRunner.query(`DROP INDEX "IDX_users_role"`);
    await queryRunner.query(`DROP INDEX "IDX_97672ac88f789774dd47f7c8be3"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "user_role"`);
  }
}