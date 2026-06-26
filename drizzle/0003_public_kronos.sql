CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(500) NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`category` varchar(100),
	`tags` text,
	`brandSlug` varchar(100),
	`brandName` varchar(255),
	`authorName` varchar(255) DEFAULT 'Procure.parts Editorial',
	`readTimeMinutes` int DEFAULT 5,
	`status` enum('draft','published') DEFAULT 'draft',
	`publishedAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;