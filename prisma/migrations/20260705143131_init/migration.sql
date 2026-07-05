-- CreateTable
CREATE TABLE "administrator" (
    "admin_national_id_number" VARCHAR(30) NOT NULL,
    "admin_name" VARCHAR(100) NOT NULL,
    "admin_code" INTEGER NOT NULL,
    "admin_password" VARCHAR(255) NOT NULL,
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT "pk_administrator" PRIMARY KEY ("admin_national_id_number")
);

-- CreateTable
CREATE TABLE "application" (
    "application_id" SERIAL NOT NULL,
    "citizen_national_id_number" VARCHAR(14) NOT NULL,
    "document_code" VARCHAR(200) NOT NULL,
    "application_status" VARCHAR(30) NOT NULL DEFAULT 'under review',
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "reviewed_at" DATE,
    "reviewed_by" VARCHAR(30),
    "rejection_reason" VARCHAR(1000),
    "application_reference_number" VARCHAR(200),
    "completed_at" DATE,

    CONSTRAINT "pk_application" PRIMARY KEY ("application_id")
);

-- CreateTable
CREATE TABLE "category" (
    "category_id" SERIAL NOT NULL,
    "category_name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "created_by" VARCHAR(30) NOT NULL DEFAULT 'LBN-1965-10006',
    "updated_at" DATE,
    "updated_by" VARCHAR(30),

    CONSTRAINT "pk_category" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "citizen" (
    "citizen_national_id_number" VARCHAR(14) NOT NULL,
    "citizen_first_name" VARCHAR(100) NOT NULL,
    "citizen_father_name" VARCHAR(100) NOT NULL,
    "citizen_last_name" VARCHAR(100) NOT NULL,
    "mother_first_name" VARCHAR(100) NOT NULL,
    "mother_last_name" VARCHAR(100) NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "place_of_birth" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(10) NOT NULL,
    "phone_number" VARCHAR(30) NOT NULL,
    "photo_url" VARCHAR(512) NOT NULL,
    "id_card_copy_url" VARCHAR(512),
    "name_index_copy_url" VARCHAR(512),
    "citizen_username" VARCHAR(255) NOT NULL,
    "citizen_password" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "created_by" VARCHAR(30) NOT NULL DEFAULT 'LBN-1965-10006',

    CONSTRAINT "pk_citizen" PRIMARY KEY ("citizen_national_id_number")
);

-- CreateTable
CREATE TABLE "citizen_registration_request" (
    "registration_reference_number" VARCHAR(20) NOT NULL,
    "citizen_national_id_number" VARCHAR(14) NOT NULL,
    "citizen_first_name" VARCHAR(100) NOT NULL,
    "citizen_father_name" VARCHAR(100) NOT NULL,
    "citizen_last_name" VARCHAR(100) NOT NULL,
    "mother_first_name" VARCHAR(100) NOT NULL,
    "mother_last_name" VARCHAR(100) NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "place_of_birth" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(10) NOT NULL,
    "phone_number" VARCHAR(30) NOT NULL,
    "photo_url" VARCHAR(512) NOT NULL,
    "id_card_copy_url" VARCHAR(512),
    "name_index_copy_url" VARCHAR(512),
    "request_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "rejection_reason" VARCHAR(500),
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "reviewed_at" DATE,
    "reviewed_by" VARCHAR(30),

    CONSTRAINT "pk_citizen_registration_request" PRIMARY KEY ("registration_reference_number")
);

-- CreateTable
CREATE TABLE "document" (
    "document_code" VARCHAR(200) NOT NULL,
    "document_name" VARCHAR(200) NOT NULL,
    "document_description" VARCHAR(1000) NOT NULL DEFAULT 'No description provided',
    "category_id" INTEGER NOT NULL,
    "fees" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "processing_days" INTEGER NOT NULL DEFAULT 3,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "created_by" VARCHAR(30) NOT NULL DEFAULT 'LBN-1965-10006',
    "updated_at" DATE,
    "updated_by" VARCHAR(30),

    CONSTRAINT "pk_document" PRIMARY KEY ("document_code")
);

-- CreateTable
CREATE TABLE "document_requirement" (
    "document_code" VARCHAR(200) NOT NULL,
    "requirement_code" VARCHAR(200) NOT NULL,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "revealed_by_requirement_code" VARCHAR(200),
    "revealed_by_values" JSONB,
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "created_by" VARCHAR(30) NOT NULL DEFAULT 'LBN-1965-10006',
    "updated_at" DATE,
    "updated_by" VARCHAR(30),

    CONSTRAINT "pk_document_requirement" PRIMARY KEY ("document_code","requirement_code")
);

-- CreateTable
CREATE TABLE "issued_document" (
    "issued_document_id" SERIAL NOT NULL,
    "citizen_national_id_number" VARCHAR(14) NOT NULL,
    "document_code" VARCHAR(200) NOT NULL,
    "application_id" INTEGER NOT NULL,
    "serial_number" VARCHAR(100) NOT NULL,
    "document_url" VARCHAR(512) NOT NULL,
    "issued_at" DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT "pk_issued_document" PRIMARY KEY ("issued_document_id")
);

-- CreateTable
CREATE TABLE "payment" (
    "payment_id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "card_number" VARCHAR(20) NOT NULL,
    "card_expiry_month" SMALLINT NOT NULL,
    "card_expiry_year" SMALLINT NOT NULL,
    "transaction_reference" VARCHAR(100) NOT NULL,
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT "pk_payment" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "requirement" (
    "requirement_code" VARCHAR(200) NOT NULL,
    "requirement_name" VARCHAR(200) NOT NULL,
    "requirement_type" VARCHAR(50) NOT NULL,
    "form_input_kind" VARCHAR(10),
    "form_options" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "created_by" VARCHAR(30) NOT NULL DEFAULT 'LBN-1965-10006',
    "updated_at" DATE,
    "updated_by" VARCHAR(30),

    CONSTRAINT "pk_requirement" PRIMARY KEY ("requirement_code")
);

-- CreateTable
CREATE TABLE "application_response" (
    "application_id" INTEGER NOT NULL,
    "requirement_code" VARCHAR(200) NOT NULL,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "attachment_url" VARCHAR(512),
    "field_value" JSONB,
    "created_at" DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT "pk_application_response" PRIMARY KEY ("application_id","requirement_code")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_administrator_code" ON "administrator"("admin_code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_application_reference_number" ON "application"("application_reference_number");

-- CreateIndex
CREATE INDEX "idx_application_citizen_national_id_number" ON "application"("citizen_national_id_number");

-- CreateIndex
CREATE INDEX "idx_application_document_code" ON "application"("document_code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_category_name" ON "category"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "uq_citizen_username" ON "citizen"("citizen_username");

-- CreateIndex
CREATE UNIQUE INDEX "idx_citizen_registration_request_one_pending_request" ON "citizen_registration_request"("citizen_national_id_number") WHERE ((request_status)::text = 'pending'::text);

-- CreateIndex
CREATE UNIQUE INDEX "uq_document_name" ON "document"("document_name");

-- CreateIndex
CREATE INDEX "idx_document_requirement_requirement_code" ON "document_requirement"("requirement_code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_issued_document_application" ON "issued_document"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_issued_document_serial" ON "issued_document"("serial_number");

-- CreateIndex
CREATE INDEX "idx_issued_document_citizen_national_id_number" ON "issued_document"("citizen_national_id_number");

-- CreateIndex
CREATE INDEX "idx_issued_document_document_code" ON "issued_document"("document_code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_payment_application" ON "payment"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_payment_transaction_reference" ON "payment"("transaction_reference");

-- CreateIndex
CREATE INDEX "idx_payment_application_id" ON "payment"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_requirement_name" ON "requirement"("requirement_name");

-- CreateIndex
CREATE INDEX "idx_application_response_requirement_code" ON "application_response"("requirement_code");

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "fk_application_citizen_national_id_number" FOREIGN KEY ("citizen_national_id_number") REFERENCES "citizen"("citizen_national_id_number") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "fk_application_document_code" FOREIGN KEY ("document_code") REFERENCES "document"("document_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "fk_application_reviwed_by" FOREIGN KEY ("reviewed_by") REFERENCES "administrator"("admin_national_id_number") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "fk_category_created_by" FOREIGN KEY ("created_by") REFERENCES "administrator"("admin_national_id_number") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "fk_category_updated_by" FOREIGN KEY ("updated_by") REFERENCES "administrator"("admin_national_id_number") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "citizen" ADD CONSTRAINT "fk_citizen_created_by" FOREIGN KEY ("created_by") REFERENCES "administrator"("admin_national_id_number") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "citizen_registration_request" ADD CONSTRAINT "fk_citizen_registration_request_reviewed_by" FOREIGN KEY ("reviewed_by") REFERENCES "administrator"("admin_national_id_number") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "fk_document_category_id" FOREIGN KEY ("category_id") REFERENCES "category"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "fk_document_created_by" FOREIGN KEY ("created_by") REFERENCES "administrator"("admin_national_id_number") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "fk_document_updated_by" FOREIGN KEY ("updated_by") REFERENCES "administrator"("admin_national_id_number") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "document_requirement" ADD CONSTRAINT "fk_document_requirement_created_by" FOREIGN KEY ("created_by") REFERENCES "administrator"("admin_national_id_number") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "document_requirement" ADD CONSTRAINT "fk_document_requirement_document_code" FOREIGN KEY ("document_code") REFERENCES "document"("document_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "document_requirement" ADD CONSTRAINT "fk_document_requirement_requirement_code" FOREIGN KEY ("requirement_code") REFERENCES "requirement"("requirement_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "document_requirement" ADD CONSTRAINT "fk_document_requirement_revealed_by" FOREIGN KEY ("revealed_by_requirement_code") REFERENCES "requirement"("requirement_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "document_requirement" ADD CONSTRAINT "fk_document_requirement_updated_by" FOREIGN KEY ("updated_by") REFERENCES "administrator"("admin_national_id_number") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "issued_document" ADD CONSTRAINT "fk_issued_document_application_id" FOREIGN KEY ("application_id") REFERENCES "application"("application_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "issued_document" ADD CONSTRAINT "fk_issued_document_citizen_national_id_number" FOREIGN KEY ("citizen_national_id_number") REFERENCES "citizen"("citizen_national_id_number") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "issued_document" ADD CONSTRAINT "fk_issued_document_document_code" FOREIGN KEY ("document_code") REFERENCES "document"("document_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "fk_payment_application_id" FOREIGN KEY ("application_id") REFERENCES "application"("application_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "requirement" ADD CONSTRAINT "fk_requirement_created_by" FOREIGN KEY ("created_by") REFERENCES "administrator"("admin_national_id_number") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "requirement" ADD CONSTRAINT "fk_requirement_updated_by" FOREIGN KEY ("updated_by") REFERENCES "administrator"("admin_national_id_number") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_response" ADD CONSTRAINT "fk_application_response_application_id" FOREIGN KEY ("application_id") REFERENCES "application"("application_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "application_response" ADD CONSTRAINT "fk_application_response_requirement_code" FOREIGN KEY ("requirement_code") REFERENCES "requirement"("requirement_code") ON DELETE NO ACTION ON UPDATE NO ACTION;
