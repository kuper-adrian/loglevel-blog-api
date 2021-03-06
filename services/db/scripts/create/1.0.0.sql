BEGIN TRANSACTION;
CREATE TABLE `User` (
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`firstName`	TEXT,
	`lastName`	TEXT,
	`nickname`	TEXT NOT NULL UNIQUE,
	`email`	TEXT,
	`password`	TEXT NOT NULL
);
CREATE TABLE `Tag` (
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`name`	TEXT NOT NULL UNIQUE
);
CREATE TABLE "RefreshToken" (
	`uuid`	TEXT NOT NULL UNIQUE,
	`userId`	INTEGER NOT NULL UNIQUE,
	`expires`	TEXT NOT NULL,
	`created`	TEXT NOT NULL,
	PRIMARY KEY(`uuid`),
	FOREIGN KEY(`userId`) REFERENCES `User`(`id`)
);
CREATE TABLE "DbInfo" (
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`version`	TEXT NOT NULL,
	`created`	TEXT NOT NULL
);
CREATE TABLE `BlogPostTagJunction` (
	`blogPostId`	INTEGER NOT NULL,
	`tagId`	INTEGER NOT NULL,
	FOREIGN KEY(`blogPostId`) REFERENCES BlogPost('id'),
	FOREIGN KEY(`tagId`) REFERENCES Tag('id')
);
CREATE TABLE "BlogPost" (
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`title`	TEXT NOT NULL,
	`plug`	TEXT NOT NULL,
	`text`	TEXT NOT NULL,
	`created`	TEXT NOT NULL,
	`published`	TEXT,
	`authorId`	INTEGER NOT NULL,
	FOREIGN KEY(`authorId`) REFERENCES User('id')
);
COMMIT;
