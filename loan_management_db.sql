-- MySQL dump 10.13  Distrib 8.0.41, for Linux (x86_64)
--
-- Host: localhost    Database: loan_management_db
-- ------------------------------------------------------
-- Server version	8.0.41-0ubuntu0.24.10.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `borrower_groups`
--

DROP TABLE IF EXISTS `borrower_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `borrower_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `createdBy` int DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `version` int NOT NULL,
  `isDeleted` tinyint NOT NULL DEFAULT '0',
  `name` varchar(255) NOT NULL,
  `groupNumber` varchar(255) NOT NULL,
  `memberCount` int NOT NULL DEFAULT '0',
  `groupLeader` varchar(255) DEFAULT NULL,
  `collectorName` varchar(255) DEFAULT NULL,
  `meetingSchedule` enum('daily','weekly','biweekly','monthly','quarterly') DEFAULT NULL,
  `status` enum('active','inactive','suspended','dissolved') NOT NULL DEFAULT 'active',
  `description` text,
  `meetingDetails` json DEFAULT NULL,
  `loanOfficerId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_a22203929bc1f7a7c2f60cd143` (`groupNumber`),
  KEY `IDX_borrower_group_group_number` (`groupNumber`),
  KEY `IDX_bab5662bd26e1bb9e759461b63` (`loanOfficerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `borrower_groups`
--

LOCK TABLES `borrower_groups` WRITE;
/*!40000 ALTER TABLE `borrower_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `borrower_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collaterals`
--

DROP TABLE IF EXISTS `collaterals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collaterals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('real_estate','vehicle','machinery','inventory','financial_instrument','personal_property','other') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `description` text NOT NULL,
  `documents` text,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `loanId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaterals`
--

LOCK TABLES `collaterals` WRITE;
/*!40000 ALTER TABLE `collaterals` DISABLE KEYS */;
/*!40000 ALTER TABLE `collaterals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `createdBy` int DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `version` int NOT NULL,
  `isDeleted` tinyint NOT NULL DEFAULT '0',
  `name` varchar(255) NOT NULL,
  `type` enum('identification','proof_of_address','bank_statement','payslip','tax_return','business_license','financial_statement','collateral_document','loan_agreement','guarantor_document','insurance_policy','other') NOT NULL,
  `category` enum('kyc','financial','legal','collateral','loan','insurance','other') NOT NULL,
  `url` varchar(255) NOT NULL,
  `description` text,
  `mimeType` varchar(255) DEFAULT NULL,
  `size` int DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `status` enum('pending','approved','rejected','expired','archived') NOT NULL DEFAULT 'pending',
  `expiryDate` date DEFAULT NULL,
  `rejectionReason` text,
  `validationResults` json DEFAULT NULL,
  `entityType` varchar(255) NOT NULL,
  `entityId` int NOT NULL,
  `loanId` int DEFAULT NULL,
  `borrowerId` int DEFAULT NULL,
  `guarantorId` int DEFAULT NULL,
  `collateralId` int DEFAULT NULL,
  `loanOfficerId` int DEFAULT NULL,
  `borrowerGroupId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_d17c41af83d0af6980bd525ae5` (`loanId`),
  KEY `IDX_9c5b5995b41718cb56135e70eb` (`borrowerId`),
  KEY `IDX_02e7ce78f72498cb329d16e733` (`guarantorId`),
  KEY `IDX_a926554fb0683ad8404c2f0f4f` (`collateralId`),
  KEY `IDX_354b8d481c892f840ff4c9811e` (`loanOfficerId`),
  KEY `IDX_a18ee2447f9f8602b76f6d1849` (`borrowerGroupId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `createdBy` int DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `version` int NOT NULL,
  `isDeleted` tinyint NOT NULL DEFAULT '0',
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `roles` json NOT NULL,
  `emailVerified` tinyint NOT NULL DEFAULT '0',
  `phoneVerified` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_a000cca60bcf04454e72769949` (`phone`),
  UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`),
  KEY `IDX_user_phone` (`phone`),
  KEY `IDX_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-14  6:59:39
