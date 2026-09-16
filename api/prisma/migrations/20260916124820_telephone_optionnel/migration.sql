/*
  Warnings:

  - You are about to drop the `chambre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `compte` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hotel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reservation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `chambre` DROP FOREIGN KEY `chambres_hotel_id_fkey`;

-- DropForeignKey
ALTER TABLE `reservation` DROP FOREIGN KEY `reservations_chambre_id_fkey`;

-- DropTable
DROP TABLE `chambre`;

-- DropTable
DROP TABLE `compte`;

-- DropTable
DROP TABLE `hotel`;

-- DropTable
DROP TABLE `reservation`;

-- CreateTable
CREATE TABLE `chambres` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hotel_id` INTEGER NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `categorie` VARCHAR(191) NOT NULL,
    `capacite` INTEGER NOT NULL,
    `prix_nuit` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `disponible` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `etoiles` INTEGER NOT NULL,
    `adresse` VARCHAR(191) NOT NULL,
    `code_postal` VARCHAR(191) NOT NULL,
    `ville` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `gerant` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comptes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NULL,
    `mot_de_passe_clair` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `hotel_id` INTEGER NULL,
    `note` VARCHAR(191) NULL,

    UNIQUE INDEX `comptes_email_key`(`email`),
    UNIQUE INDEX `comptes_telephone_key`(`telephone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `voyageur_id` INTEGER NOT NULL,
    `chambre_id` INTEGER NOT NULL,
    `date_arrivee` DATE NOT NULL,
    `date_depart` DATE NOT NULL,
    `nb_personnes` INTEGER NOT NULL,
    `statut` VARCHAR(191) NOT NULL,
    `demande_speciale` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `chambres` ADD CONSTRAINT `chambres_hotel_id_fkey` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_chambre_id_fkey` FOREIGN KEY (`chambre_id`) REFERENCES `chambres`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
