generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["partialIndexes"]
}

datasource db {
  provider = "postgresql"
}

/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.
model administrator {
  admin_national_id_number                                            String                         @id(map: "pk_administrator") @db.VarChar(30)
  admin_name                                                          String                         @db.VarChar(100)
  admin_code                                                          Int                            @unique(map: "uq_administrator_code")
  admin_password                                                      String                         @db.VarChar(255)
  created_at                                                          DateTime                       @default(dbgenerated("CURRENT_DATE")) @db.Date
  application                                                         application[]
  category_category_created_byToadministrator                         category[]                     @relation("category_created_byToadministrator")
  category_category_updated_byToadministrator                         category[]                     @relation("category_updated_byToadministrator")
  citizen                                                             citizen[]
  citizen_registration_request                                        citizen_registration_request[]
  document_document_created_byToadministrator                         document[]                     @relation("document_created_byToadministrator")
  document_document_updated_byToadministrator                         document[]                     @relation("document_updated_byToadministrator")
  document_requirement_document_requirement_created_byToadministrator document_requirement[]         @relation("document_requirement_created_byToadministrator")
  document_requirement_document_requirement_updated_byToadministrator document_requirement[]         @relation("document_requirement_updated_byToadministrator")
  requirement_requirement_created_byToadministrator                   requirement[]                  @relation("requirement_created_byToadministrator")
  requirement_requirement_updated_byToadministrator                   requirement[]                  @relation("requirement_updated_byToadministrator")
}

/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.
model application {
  application_id               Int                    @id(map: "pk_application") @default(autoincrement())
  citizen_national_id_number   String                 @db.VarChar(14)
  document_code                String                 @db.VarChar(200)
  application_status           String                 @default("under review") @db.VarChar(30)
  created_at                   DateTime               @default(dbgenerated("CURRENT_DATE")) @db.Date
  reviewed_at                  DateTime?              @db.Date
  reviewed_by                  String?                @db.VarChar(30)
  rejection_reason             String?                @db.VarChar(1000)
  application_reference_number String?                @unique(map: "uq_application_reference_number") @db.VarChar(200)
  completed_at                 DateTime?              @db.Date
  citizen                      citizen                @relation(fields: [citizen_national_id_number], references: [citizen_national_id_number], onDelete: NoAction, onUpdate: NoAction, map: "fk_application_citizen_national_id_number")
  document                     document               @relation(fields: [document_code], references: [document_code], onDelete: NoAction, onUpdate: NoAction, map: "fk_application_document_code")
  administrator                administrator?         @relation(fields: [reviewed_by], references: [admin_national_id_number], onDelete: NoAction, onUpdate: NoAction, map: "fk_application_reviwed_by")
  application_response         application_response[]
  issued_document              issued_document?
  payment                      payment?

  @@index([citizen_national_id_number], map: "idx_application_citizen_national_id_number")
  @@index([document_code], map: "idx_application_document_code")
}

/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.
model category {
  category_id                                      Int            @id(map: "pk_category") @default(autoincrement())
  category_name                                    String         @unique(map: "uq_category_name") @db.VarChar(100)
  is_active                                        Boolean        @default(true)
  created_at                                       DateTime       @default(dbgenerated("CURRENT_DATE")) @db.Date
  created_by                                       String         @default("LBN-1965-10006") @db.VarChar(30)
  updated_at                                       DateTime?      @db.Date
  updated_by                                       String?        @db.VarChar(30)
  administrator_category_created_byToadministrator administrator  @relation("category_created_byToadministrator", fields: [created_by], references: [admin_national_id_number], onDelete: NoAction, onUpdate: NoAction, map: "fk_category_created_by")
  administrator_category_updated_byToadministrator administrator? @relation("category_updated_byToadministrator", fields: [updated_by], references: [admin_national_id_number], onDelete: NoAction, onUpdate: NoAction, map: "fk_category_updated_by")
  document                                         document[]
}

/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.
/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.
model citizen {
  citizen_national_id_number String            @id(map: "pk_citizen") @db.VarChar(14)
  citizen_first_name         String            @db.VarChar(100)
  citizen_father_name        String            @db.VarChar(100)
  citizen_last_name          String            @db.VarChar(100)
  mother_first_name          String            @db.VarChar(100)
  mother_last_name           String            @db.VarChar(100)
  date_of_birth              DateTime          @db.Date
  place_of_birth             String            @db.VarChar(100)
  gender                     String            @db.VarChar(10)
  phone_number               String            @db.VarChar(30)
  photo_url                  String            @db.VarChar(512)
  id_card_copy_url           String?           @db.VarChar(512)
  name_index_copy_url        String?           @db.VarChar(512)
  citizen_username           String            @unique(map: "uq_citizen_username") @db.VarChar(255)
  citizen_password           String            @db.VarChar(255)
  is_active                  Boolean           @default(true)
  created_at                 DateTime          @default(dbgenerated("CURRENT_DATE")) @db.Date
  created_by                 String            @default("LBN-1965-10006") @db.VarChar(30)
  application                application[]
  administrator              administrator     @relation(fields: [created_by], references: [admin_national_id_number], onDelete: NoAction, onUpdate: NoAction, map: "fk_citizen_created_by")
  issued_document            issued_document[]
}

/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.
model citizen_registration_request {
  registration_reference_number String         @id(map: "pk_citizen_registration_request") @db.VarChar(20)
  citizen_national_id_number    String         @unique(map: "idx_citizen_registration_request_one_pending_request", where: raw("((request_status)::text = 'pending'::text)")) @db.VarChar(14)
  citizen_first_name            String         @db.VarChar(100)
  citizen_father_name           String         @db.VarChar(100)
  citizen_last_name             String         @db.VarChar(100)
  mother_first_name             String         @db.VarChar(100)
  mother_last_name              String         @db.VarChar(100)
  date_of_birth                 DateTime       @db.Date
  place_of_birth                String         @db.VarChar(100)
  gender                        String         @db.VarChar(10)
  phone_number                  String         @db.VarChar(30)
  photo_url                     String         @db.VarChar(512)
  id_card_copy_url              String?        @db.VarChar(512)
  name_index_copy_url           String?        @db.VarChar(512)
  request_status                String         @default("pending") @db.VarChar(20)
  rejection_reason              String?        @db.VarChar(500)
  created_at                    DateTime       @default(dbgenerated("CURRENT_DATE")) @db.Date
  reviewed_at                   DateTime?      @db.Date
  reviewed_by                   String?        @db.VarChar(30)
  administrator                 administrator? @relation(fields: [reviewed_by], references: [admin_national_id_number], onDelete: NoAction, onUpdate: NoAction, map: "fk_citizen_registration_request_reviewed_by")
}

/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.
model document {
  document_code                                    String                 @id(map: "pk_document") @db.VarChar(200)
  document_name                                    String                 @unique(map: "uq_document_name") @db.VarChar(200)
  document_description                             String                 @default("No description provided") @db.VarChar(1000)
  category_id                                      Int
  fees                                             Decimal                @default(0) @db.Decimal(10, 2)
  processing_days                                  Int                    @default(3)
  is_active                                        Boolean                @default(true)
  created_at                                       DateTime               @default(dbgenerated("CURRENT_DATE")) @db.Date
  created_by                                       String                 @default("LBN-1965-10006") @db.VarChar(30)
  updated_at                                       DateTime?              @db.Date
  updated_by                                       String?                @db.VarChar(30)
  application                                      application[]
  category                                         category               @relation(fields: [category_id], references: [category_id], onDelete: NoAction, onUpdate: NoAction, map: "fk_document_category_id")
  administrator_document_created_byToadministrator administrator          @relation("document_created_byToadministrator", fields: [created_by], references: [admin_national_id_number], onDelete: NoAction, onUpdate: NoAction, map: "fk_document_created_by")
  administrator_document_updated_byToadministrator administrator?         @relation("document_updated_byToadministrator", fields: [updated_by], references: [admin_national_id_number], onDelete: NoAction, onUpdate: NoAction, map: "fk_document_updated_by")
  document_requirement                             document_requirement[]
  issued_document                                  issued_document[]
}

model document_requirement {
  document_code                                                              String         @db.VarChar(200)
  requirement_code                                                           String         @db.VarChar(200)
  is_mandatory                                                               Boolean        @default(true)
  revealed_by_requirement_code                                               String?        @db.VarChar(200)
  revealed_by_values                                                         Json?
  created_at                                                                 DateTime       @default(dbgenerated("CURRENT_DATE")) @db.Date
  created_by                                                                 String         @default("LBN-1965-10006") @db.VarChar(30)
  updated_at                                                                 DateTime?      @db.Date
  updated_by                                                                 String?        @db.VarChar(30)
  administrator_document_requirement_created_byToadministrator               administrator  @relation("document_requirement_created_byToadministrator", fields: [created_by], references: [admin_national_id_number], onDelete: NoAction, onUpdate: NoAction, map: "fk_document_requirement_created_by")
  document                                                                   document       @relation(fields: [document_code], references: [document_code], onDelete: NoAction, onUpdate: NoAction, map: "fk_document_requirement_document_code")
  requirement                                                                requirement    @relation(fields: [requirement_code], references: [requirement_code], onDelete: NoAction, onUpdate: NoAction, map: "fk_document_requirement_requirement_code")
  requirement_document_requirement_revealed_by_requirement_codeTorequirement requirement?   @relation("document_requirement_revealed_by_requirement_codeTorequirement", fields: [revealed_by_requirement_code], references: [requirement_code], onDelete: NoAction, onUpdate: NoAction, map: "fk_document_requirement_revealed_by")
  administrator_document_requirement_updated_byToadministrator               administrator? @relation("document_requirement_updated_byToadministrator", fields: [updated_by], references: [admin_national_id_number], onDelete: NoAction, onUpdate: NoAction, map: "fk_document_requirement_updated_by")

  @@id([document_code, requirement_code], map: "pk_document_requirement")
  @@index([requirement_code], map: "idx_document_requirement_requirement_code")
}

/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.
model issued_document {
  issued_document_id         Int         @id(map: "pk_issued_document") @default(autoincrement())
  citizen_national_id_number String      @db.VarChar(14)
  document_code              String      @db.VarChar(200)
  application_id             Int         @unique(map: "uq_issued_document_application")
  serial_number              String      @unique(map: "uq_issued_document_serial") @db.VarChar(100)
  document_url               String      @db.VarChar(512)
  issued_at                  DateTime    @default(dbgenerated("CURRENT_DATE")) @db.Date
  application                application @relation(fields: [application_id], references: [application_id], onDelete: NoAction, onUpdate: NoAction, map: "fk_issued_document_application_id")
  citizen                    citizen     @relation(fields: [citizen_national_id_number], references: [citizen_national_id_number], onDelete: NoAction, onUpdate: NoAction, map: "fk_issued_document_citizen_national_id_number")
  document                   document    @relation(fields: [document_code], references: [document_code], onDelete: NoAction, onUpdate: NoAction, map: "fk_issued_document_document_code")

  @@index([citizen_national_id_number], map: "idx_issued_document_citizen_national_id_number")
  @@index([document_code], map: "idx_issued_document_document_code")
}

/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.
model payment {
  payment_id            Int         @id(map: "pk_payment") @default(autoincrement())
  application_id        Int         @unique(map: "uq_payment_application")
  amount                Decimal     @db.Decimal(10, 2)
  currency              String      @default("USD") @db.Char(3)
  card_number           String      @db.VarChar(20)
  card_expiry_month     Int         @db.SmallInt
  card_expiry_year      Int         @db.SmallInt
  transaction_reference String      @unique(map: "uq_payment_transaction_reference") @db.VarChar(100)
  created_at            DateTime    @default(dbgenerated("CURRENT_DATE")) @db.Date
  application           application @relation(fields: [application_id], references: [application_id], onDelete: NoAction, onUpdate: NoAction, map: "fk_payment_application_id")

  @@index([application_id], map: "idx_payment_application_id")
}

/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.
model requirement {
  requirement_code                                                                    String                 @id(map: "pk_requirement") @db.VarChar(200)
  requirement_name                                                                    String                 @unique(map: "uq_requirement_name") @db.VarChar(200)
  requirement_type                                                                    String                 @db.VarChar(50)
  form_input_kind                                                                     String?                @db.VarChar(10)
  form_options                                                                        Json?
  is_active                                                                           Boolean                @default(true)
  created_at                                                                          DateTime               @default(dbgenerated("CURRENT_DATE")) @db.Date
  created_by                                                                          String                 @default("LBN-1965-10006") @db.VarChar(30)
  updated_at                                                                          DateTime?              @db.Date
  updated_by                                                                          String?                @db.VarChar(30)
  application_response                                                                application_response[]
  document_requirement                                                                document_requirement[]
  document_requirement_document_requirement_revealed_by_requirement_codeTorequirement document_requirement[] @relation("document_requirement_revealed_by_requirement_codeTorequirement")
  administrator_requirement_created_byToadministrator                                 administrator          @relation("requirement_created_byToadministrator", fields: [created_by], references: [admin_national_id_number], onDelete: NoAction, onUpdate: NoAction, map: "fk_requirement_created_by")
  administrator_requirement_updated_byToadministrator                                 administrator?         @relation("requirement_updated_byToadministrator", fields: [updated_by], references: [admin_national_id_number], onDelete: NoAction, onUpdate: NoAction, map: "fk_requirement_updated_by")
}

/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.
model application_response {
  application_id   Int
  requirement_code String      @db.VarChar(200)
  is_mandatory     Boolean     @default(true)
  attachment_url   String?     @db.VarChar(512)
  field_value      Json?
  created_at       DateTime    @default(dbgenerated("CURRENT_DATE")) @db.Date
  application      application @relation(fields: [application_id], references: [application_id], onDelete: NoAction, onUpdate: NoAction, map: "fk_application_response_application_id")
  requirement      requirement @relation(fields: [requirement_code], references: [requirement_code], onDelete: NoAction, onUpdate: NoAction, map: "fk_application_response_requirement_code")

  @@id([application_id, requirement_code], map: "pk_application_response")
  @@index([requirement_code], map: "idx_application_response_requirement_code")
}
