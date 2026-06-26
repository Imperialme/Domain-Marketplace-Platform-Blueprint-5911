CREATE TABLE `ai_intelligence_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rfqId` int,
	`requestedBy` int,
	`prompt` text NOT NULL,
	`response` text,
	`model` varchar(100),
	`tokensUsed` int,
	`actionTaken` text,
	`status` enum('pending','completed','failed') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_intelligence_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorId` int,
	`actorRole` varchar(32),
	`actionType` varchar(100) NOT NULL,
	`entityType` enum('rfq','company','vendor','quotation','fee','part','margin_rule','user','ai_query') NOT NULL,
	`entityId` varchar(64),
	`beforeStateJson` json,
	`afterStateJson` json,
	`notes` text,
	`errorDetails` text,
	`isError` boolean DEFAULT false,
	`patternTags` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `buyer_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rfqId` int NOT NULL,
	`companyId` int NOT NULL,
	`quotationId` int,
	`source` enum('system_triggered','admin_manual') DEFAULT 'system_triggered',
	`priceFeedback` enum('too_high','acceptable','low'),
	`leadTimeFeedback` enum('too_long','acceptable','fast'),
	`overallRating` int,
	`comments` text,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `buyer_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cms_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageKey` varchar(50) NOT NULL,
	`sectionKey` varchar(100) NOT NULL,
	`content` text NOT NULL,
	`lastUpdatedBy` int,
	`lastUpdatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cms_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` varchar(32) NOT NULL,
	`userId` int,
	`legalName` varchar(255) NOT NULL,
	`country` varchar(100) NOT NULL,
	`operatingRegions` text,
	`industry` enum('automotive','industrial','heavy_equipment','marine','power_gen') NOT NULL,
	`website` varchar(255),
	`businessEmail` varchar(320) NOT NULL,
	`applicantRole` enum('decision_maker','influencer','sourcing_executive') NOT NULL,
	`teamSize` varchar(50),
	`avgOrderValue` varchar(50),
	`annualVolume` varchar(50),
	`pastPurchaseExamples` text,
	`sourcingRegions` text,
	`procurementFrequency` enum('monthly','quarterly','project_based') NOT NULL,
	`reasonForApplying` text,
	`status` enum('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
	`riskFlag` enum('green','yellow','red') DEFAULT 'yellow',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`approvedAt` timestamp,
	`approvedBy` int,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `companies_companyId_unique` UNIQUE(`companyId`)
);
--> statement-breakpoint
CREATE TABLE `desk_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('rfq','company','vendor','quotation','fee','general') NOT NULL,
	`entityId` varchar(64),
	`contextTag` enum('COMPLIANCE','RFQ','GENERAL','PAYMENT','QUOTATION') NOT NULL,
	`fromUserId` int,
	`toUserId` int,
	`subject` varchar(255),
	`body` text NOT NULL,
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `desk_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `engagement_fees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rfqId` int NOT NULL,
	`feeAmount` decimal(10,2) NOT NULL,
	`currency` varchar(10) DEFAULT 'USD',
	`status` enum('requested','paid','adjusted','waived') NOT NULL DEFAULT 'requested',
	`paymentMethod` enum('stripe','paypal'),
	`paymentReference` varchar(255),
	`stripePaymentIntentId` varchar(255),
	`paypalOrderId` varchar(255),
	`adjustedAmount` decimal(10,2),
	`waivedBy` int,
	`waivedReason` text,
	`paidAt` timestamp,
	`adjustedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `engagement_fees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `margin_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleName` varchar(100) NOT NULL,
	`conditionMinPct` decimal(8,2),
	`conditionMaxPct` decimal(8,2),
	`marginPct` decimal(8,2) NOT NULL,
	`ruleType` enum('oem','am_tier','am_cap') NOT NULL,
	`isActive` boolean DEFAULT true,
	`lastUpdatedBy` int,
	`lastUpdatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `margin_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parts_intelligence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partId` int NOT NULL,
	`lowestAmPriceEver` decimal(12,2),
	`highestAmPriceEver` decimal(12,2),
	`lowestOemPriceEver` decimal(12,2),
	`highestOemPriceEver` decimal(12,2),
	`activeSupplierCount` int DEFAULT 0,
	`medianAmPrice` decimal(12,2),
	`medianOemPrice` decimal(12,2),
	`priceVolatilityIndex` float DEFAULT 0,
	`freshnessScore` float DEFAULT 0,
	`marketConfidenceLevel` enum('low','medium','high') DEFAULT 'low',
	`lastUpdated` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parts_intelligence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parts_master` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partDnaId` varchar(32) NOT NULL,
	`brand` varchar(100),
	`oemPartNumber` varchar(100) NOT NULL,
	`alternateNumbers` text,
	`description` text,
	`category` varchar(100),
	`subcategory` varchar(100),
	`compatibility` text,
	`countryOfOrigin` varchar(100),
	`hsCode` varchar(20),
	`uom` varchar(20),
	`weightDimensions` text,
	`status` enum('active','dormant','obsolete') NOT NULL DEFAULT 'active',
	`quoteFrequencyCount` int DEFAULT 0,
	`firstSeenDate` timestamp DEFAULT (now()),
	`lastUpdatedDate` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	`lastUpdatedBy` int,
	CONSTRAINT `parts_master_id` PRIMARY KEY(`id`),
	CONSTRAINT `parts_master_partDnaId_unique` UNIQUE(`partDnaId`)
);
--> statement-breakpoint
CREATE TABLE `parts_quote_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partId` int NOT NULL,
	`rfqId` int,
	`quotedToCompanyId` int,
	`amSellPrice` decimal(12,2),
	`oemSellPrice` decimal(12,2),
	`outcome` enum('accepted','declined','no_response'),
	`buyerFeedbackSource` enum('system','manual'),
	`buyerFeedbackText` text,
	`feedbackReceivedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `parts_quote_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parts_supplier_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partId` int NOT NULL,
	`vendorId` int NOT NULL,
	`priceValidityStart` timestamp,
	`priceValidityEnd` timestamp,
	`isExpired` boolean DEFAULT false,
	`lastQuotedPrice` decimal(12,2),
	`lastQuotedDate` timestamp,
	CONSTRAINT `parts_supplier_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rfqId` int NOT NULL,
	`marginMode` enum('fixed','custom') NOT NULL DEFAULT 'fixed',
	`supplierCostAm` decimal(12,2),
	`supplierCostOem` decimal(12,2),
	`logisticsCost` decimal(12,2),
	`marginPctAm` decimal(6,2),
	`marginPctOem` decimal(6,2),
	`finalBuyerPriceAm` decimal(12,2),
	`finalBuyerPriceOem` decimal(12,2),
	`currency` varchar(10) DEFAULT 'USD',
	`leadTimeDays` int,
	`validityDays` int DEFAULT 30,
	`comparisonTableJson` json,
	`lineItemsJson` json,
	`status` enum('draft','issued','accepted','declined') NOT NULL DEFAULT 'draft',
	`issuedAt` timestamp,
	`acceptedAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quotations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rfqs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referenceNumber` varchar(20) NOT NULL,
	`companyId` int NOT NULL,
	`itemListFileUrl` text,
	`itemListFileName` varchar(255),
	`estimatedValueTier` enum('5k_20k','20k_100k','100k_plus') NOT NULL,
	`timelineTier` enum('0_14_days','15_30_days','budgeting') NOT NULL,
	`priority` enum('standard','priority') NOT NULL DEFAULT 'standard',
	`status` enum('submitted','reviewing','fee_requested','fee_paid','sourcing','quoted','closed') NOT NULL DEFAULT 'submitted',
	`outcomeCode` enum('quotation_issued','not_commercially_viable','cannot_identify','not_sourceable'),
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`closedAt` timestamp,
	`closedBy` int,
	CONSTRAINT `rfqs_id` PRIMARY KEY(`id`),
	CONSTRAINT `rfqs_referenceNumber_unique` UNIQUE(`referenceNumber`)
);
--> statement-breakpoint
CREATE TABLE `vendor_prices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partId` int NOT NULL,
	`vendorId` int NOT NULL,
	`currency` varchar(10) DEFAULT 'USD',
	`unitPrice` decimal(12,2) NOT NULL,
	`condition` enum('oem','aftermarket') NOT NULL,
	`moq` int DEFAULT 1,
	`availableQty` int,
	`leadTimeDays` int,
	`stockStatus` enum('in_stock','on_order','unavailable') DEFAULT 'in_stock',
	`region` varchar(100),
	`validityStart` timestamp,
	`validityEnd` timestamp,
	`approvalStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`approvedBy` int,
	`approvedAt` timestamp,
	CONSTRAINT `vendor_prices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` varchar(32) NOT NULL,
	`userId` int,
	`internalAlias` varchar(255) NOT NULL,
	`vendorType` enum('distributor','dealer','supplier') NOT NULL,
	`industryFocus` text,
	`region` varchar(100),
	`status` enum('active','suspended','pending') NOT NULL DEFAULT 'pending',
	`accuracyScore` float DEFAULT 0,
	`fulfilmentRate` float DEFAULT 0,
	`leadTimeAccuracy` float DEFAULT 0,
	`pricingStability` float DEFAULT 0,
	`lastSuccessfulOrderDate` timestamp,
	`internalNotes` text,
	`inviteToken` varchar(128),
	`inviteTokenExpiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`invitedBy` int,
	CONSTRAINT `vendors_id` PRIMARY KEY(`id`),
	CONSTRAINT `vendors_vendorId_unique` UNIQUE(`vendorId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('super_admin','admin','buyer','vendor','user') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `ai_intelligence_log` ADD CONSTRAINT `ai_intelligence_log_rfqId_rfqs_id_fk` FOREIGN KEY (`rfqId`) REFERENCES `rfqs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_intelligence_log` ADD CONSTRAINT `ai_intelligence_log_requestedBy_users_id_fk` FOREIGN KEY (`requestedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_actorId_users_id_fk` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `buyer_feedback` ADD CONSTRAINT `buyer_feedback_rfqId_rfqs_id_fk` FOREIGN KEY (`rfqId`) REFERENCES `rfqs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `buyer_feedback` ADD CONSTRAINT `buyer_feedback_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `buyer_feedback` ADD CONSTRAINT `buyer_feedback_quotationId_quotations_id_fk` FOREIGN KEY (`quotationId`) REFERENCES `quotations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cms_content` ADD CONSTRAINT `cms_content_lastUpdatedBy_users_id_fk` FOREIGN KEY (`lastUpdatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `companies` ADD CONSTRAINT `companies_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `companies` ADD CONSTRAINT `companies_approvedBy_users_id_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `desk_messages` ADD CONSTRAINT `desk_messages_fromUserId_users_id_fk` FOREIGN KEY (`fromUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `desk_messages` ADD CONSTRAINT `desk_messages_toUserId_users_id_fk` FOREIGN KEY (`toUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `engagement_fees` ADD CONSTRAINT `engagement_fees_rfqId_rfqs_id_fk` FOREIGN KEY (`rfqId`) REFERENCES `rfqs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `engagement_fees` ADD CONSTRAINT `engagement_fees_waivedBy_users_id_fk` FOREIGN KEY (`waivedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `margin_rules` ADD CONSTRAINT `margin_rules_lastUpdatedBy_users_id_fk` FOREIGN KEY (`lastUpdatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `parts_intelligence` ADD CONSTRAINT `parts_intelligence_partId_parts_master_id_fk` FOREIGN KEY (`partId`) REFERENCES `parts_master`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `parts_master` ADD CONSTRAINT `parts_master_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `parts_master` ADD CONSTRAINT `parts_master_lastUpdatedBy_users_id_fk` FOREIGN KEY (`lastUpdatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `parts_quote_history` ADD CONSTRAINT `parts_quote_history_partId_parts_master_id_fk` FOREIGN KEY (`partId`) REFERENCES `parts_master`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `parts_quote_history` ADD CONSTRAINT `parts_quote_history_quotedToCompanyId_companies_id_fk` FOREIGN KEY (`quotedToCompanyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `parts_supplier_links` ADD CONSTRAINT `parts_supplier_links_partId_parts_master_id_fk` FOREIGN KEY (`partId`) REFERENCES `parts_master`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `parts_supplier_links` ADD CONSTRAINT `parts_supplier_links_vendorId_vendors_id_fk` FOREIGN KEY (`vendorId`) REFERENCES `vendors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_rfqId_rfqs_id_fk` FOREIGN KEY (`rfqId`) REFERENCES `rfqs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rfqs` ADD CONSTRAINT `rfqs_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rfqs` ADD CONSTRAINT `rfqs_closedBy_users_id_fk` FOREIGN KEY (`closedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vendor_prices` ADD CONSTRAINT `vendor_prices_partId_parts_master_id_fk` FOREIGN KEY (`partId`) REFERENCES `parts_master`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vendor_prices` ADD CONSTRAINT `vendor_prices_vendorId_vendors_id_fk` FOREIGN KEY (`vendorId`) REFERENCES `vendors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vendor_prices` ADD CONSTRAINT `vendor_prices_approvedBy_users_id_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vendors` ADD CONSTRAINT `vendors_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vendors` ADD CONSTRAINT `vendors_invitedBy_users_id_fk` FOREIGN KEY (`invitedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;