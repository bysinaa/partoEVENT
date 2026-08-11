-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EDITOR',
    "avatar" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'OTHER',
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt_text" TEXT,
    "alt_text_fa" TEXT,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_fa" TEXT,
    "description_en" TEXT,
    "description_fa" TEXT,
    "icon_id" TEXT,
    "cover_image_id" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "seo_title_en" TEXT,
    "seo_title_fa" TEXT,
    "seo_desc_en" TEXT,
    "seo_desc_fa" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "english_name" TEXT,
    "description_en" TEXT,
    "description_fa" TEXT,
    "logo_id" TEXT,
    "cover_image_id" TEXT,
    "website" TEXT,
    "location_en" TEXT,
    "location_fa" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "seo_title_en" TEXT,
    "seo_title_fa" TEXT,
    "seo_desc_en" TEXT,
    "seo_desc_fa" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_services" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,

    CONSTRAINT "client_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_fa" TEXT,
    "description_en" TEXT,
    "description_fa" TEXT,
    "thumbnail_id" TEXT,
    "cover_image_id" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "year" INTEGER,
    "location_en" TEXT,
    "location_fa" TEXT,
    "seo_title_en" TEXT,
    "seo_title_fa" TEXT,
    "seo_desc_en" TEXT,
    "seo_desc_fa" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_clients" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,

    CONSTRAINT "project_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_fa" TEXT,
    "position_en" TEXT,
    "position_fa" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "biography_en" TEXT,
    "biography_fa" TEXT,
    "photo_id" TEXT,
    "instagram" TEXT,
    "linkedin" TEXT,
    "twitter" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_fa" TEXT,
    "description_en" TEXT,
    "description_fa" TEXT,
    "type" TEXT NOT NULL DEFAULT 'general',
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_fa" TEXT,
    "content_en" TEXT,
    "content_fa" TEXT,
    "excerpt_en" TEXT,
    "excerpt_fa" TEXT,
    "cover_image_id" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "seo_title_en" TEXT,
    "seo_title_fa" TEXT,
    "seo_desc_en" TEXT,
    "seo_desc_fa" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_fa" TEXT,
    "content_en" TEXT,
    "content_fa" TEXT,
    "excerpt_en" TEXT,
    "excerpt_fa" TEXT,
    "cover_image_id" TEXT,
    "category_id" TEXT,
    "author_id" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "seo_title_en" TEXT,
    "seo_title_fa" TEXT,
    "seo_desc_en" TEXT,
    "seo_desc_fa" TEXT,
    "tags" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_items" (
    "id" TEXT NOT NULL,
    "media_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'image',
    "order" INTEGER NOT NULL DEFAULT 0,
    "caption_en" TEXT,
    "caption_fa" TEXT,
    "video_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "group" TEXT NOT NULL DEFAULT 'general',

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menus" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_fa" TEXT,
    "location" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "label_en" TEXT NOT NULL,
    "label_fa" TEXT,
    "url" TEXT,
    "page_id" TEXT,
    "parent_id" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "target" TEXT NOT NULL DEFAULT '_self',

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "ip" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "details" TEXT,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "clients_slug_key" ON "clients"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "client_services_client_id_service_id_key" ON "client_services"("client_id", "service_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "project_clients_project_id_client_id_key" ON "project_clients"("project_id", "client_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_photo_id_key" ON "team_members"("photo_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_key_key" ON "site_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "menus_slug_key" ON "menus"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "client_services" ADD CONSTRAINT "client_services_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_services" ADD CONSTRAINT "client_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_clients" ADD CONSTRAINT "project_clients_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_clients" ADD CONSTRAINT "project_clients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
