-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: banking
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `savings`
--

DROP TABLE IF EXISTS `savings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `savings` (
  `user_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `goal` decimal(10,2) DEFAULT NULL,
  KEY `user_id` (`user_id`),
  CONSTRAINT `savings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `savings`
--

LOCK TABLES `savings` WRITE;
/*!40000 ALTER TABLE `savings` DISABLE KEYS */;
INSERT INTO `savings` VALUES (1,80.00,200.00),(3,316.00,500.00),(4,0.00,0.00),(6,50.00,100.00);
/*!40000 ALTER TABLE `savings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `transaction_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=165 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (82,1,10.00,'2024-04-13 15:49:28','User topped up'),(83,1,5.00,'2024-04-13 15:49:33','User topped up'),(84,1,2.00,'2024-04-13 15:49:35','User topped up'),(85,1,2.00,'2024-04-13 15:49:43','User topped up'),(86,1,2.00,'2024-04-13 15:49:52','User topped up'),(87,1,3.00,'2024-04-13 15:49:56','User topped up'),(88,1,10.00,'2024-04-13 15:50:28','User topped up'),(89,1,10.00,'2024-04-13 15:51:19','User topped up'),(90,1,10.00,'2024-04-13 15:51:41','User topped up'),(91,1,1.00,'2024-04-13 15:51:45','User topped up'),(92,1,1.00,'2024-04-13 15:55:00','User topped up'),(93,1,10.00,'2024-04-13 15:55:08','User topped up'),(94,1,1.00,'2024-04-13 15:56:04','User topped up'),(95,1,1.00,'2024-04-13 15:57:15','User topped up'),(96,1,1.00,'2024-04-13 15:58:26','User topped up'),(97,1,2.00,'2024-04-13 15:58:30','User topped up'),(98,1,1.00,'2024-04-13 15:58:48','User topped up'),(99,1,1.00,'2024-04-13 16:01:40','User topped up'),(100,1,1.00,'2024-04-13 16:02:33','User topped up'),(101,1,2.00,'2024-04-13 16:02:40','User topped up'),(102,1,1.00,'2024-04-13 16:05:24','User topped up'),(103,1,13.00,'2024-04-13 16:05:34','User topped up'),(104,1,15.00,'2024-04-13 16:06:03','User topped up'),(105,1,5.00,'2024-04-13 16:06:09','User topped up'),(106,1,1.00,'2024-04-13 16:17:02','User topped up'),(107,1,23.00,'2024-04-13 16:17:11','User topped up'),(108,1,1.00,'2024-04-13 16:17:18','User topped up'),(109,1,2.00,'2024-04-13 16:18:49','User topped up'),(110,1,2.00,'2024-04-13 16:18:56','User topped up'),(111,1,12.00,'2024-04-13 16:21:17','User topped up'),(112,1,1.00,'2024-04-13 16:32:32','User topped up'),(113,1,1.00,'2024-04-13 16:39:38','User topped up'),(114,1,1.00,'2024-04-13 17:00:26','User topped up'),(115,1,10.00,'2024-04-13 17:13:04','User topped up'),(116,1,1.00,'2024-04-13 17:18:05','User topped up'),(117,1,11.00,'2024-04-13 17:18:06','User topped up'),(118,1,1.00,'2024-04-13 17:23:19','User topped up'),(119,1,1.00,'2024-04-13 17:30:09','User topped up'),(120,1,5.00,'2024-04-13 17:58:24','User topped up'),(121,1,5.00,'2024-04-13 17:58:29','User topped up'),(122,1,10.00,'2024-04-13 19:19:28','User topped up'),(123,1,-20.00,'2024-04-13 19:22:15','Transfer of $20 to DomantasK'),(124,2,20.00,'2024-04-13 19:22:15','Received $20 from user ID 1'),(125,1,-10.00,'2024-04-13 19:22:29','Transfer of $10 to DomantasK'),(126,2,10.00,'2024-04-13 19:22:29','Received $10 from user ID 1'),(127,1,10.00,'2024-04-13 20:41:29','User topped up'),(128,1,-10.00,'2024-04-13 20:54:26','Deducted for savings addition'),(129,1,10.00,'2024-04-13 20:54:26','Added to savings'),(130,1,-10.00,'2024-04-13 20:59:37','Deducted for savings addition'),(131,1,10.00,'2024-04-13 20:59:37','Added to savings'),(132,3,10.00,'2024-04-13 23:26:02','User topped up'),(133,3,50.00,'2024-04-13 23:27:14','User topped up'),(134,3,-10.00,'2024-04-13 23:27:31','Transfer of $10 to DomantasK'),(135,2,10.00,'2024-04-13 23:27:31','Received $10 from user ID 3'),(136,3,40.00,'2024-04-14 11:12:01','User topped up'),(137,3,10.00,'2024-04-14 11:47:10','User topped up'),(138,3,-10.00,'2024-04-14 11:48:30','Transfer of $10 to DomantasK'),(139,2,10.00,'2024-04-14 11:48:30','Received $10 from user ID 3'),(140,3,-10.00,'2024-04-14 12:02:03','Deducted for savings addition'),(141,3,-10.00,'2024-04-14 12:02:08','Deducted for savings addition'),(142,3,-10.00,'2024-04-14 12:02:12','Deducted for savings addition'),(143,3,10.00,'2024-04-14 12:10:12','User topped up'),(144,3,-20.00,'2024-04-14 12:10:24','Transfer of $20 to DomantasK'),(145,2,20.00,'2024-04-14 12:10:24','Received $20 from user ID 3'),(146,3,-5.00,'2024-04-14 12:10:38','Deducted for savings addition'),(147,3,-1.00,'2024-04-14 12:14:00','Deducted for savings addition'),(148,3,-20.00,'2024-04-14 12:14:59','Deducted for savings addition'),(149,3,-60.00,'2024-04-14 12:15:17','Deducted for savings addition'),(150,3,500.00,'2024-04-14 12:15:28','User topped up'),(151,3,-55.00,'2024-04-14 12:15:38','Transfer of $55 to DomantasK'),(152,2,55.00,'2024-04-14 12:15:38','Received $55 from user ID 3'),(153,3,10.00,'2024-04-14 12:17:51','User topped up'),(154,3,-10.00,'2024-04-14 12:18:04','Transfer of $10 to DomantasK'),(155,2,10.00,'2024-04-14 12:18:04','Received $10 from user ID 3'),(156,3,-100.00,'2024-04-14 12:18:28','Deducted for savings addition'),(157,3,-100.00,'2024-04-14 12:18:29','Deducted for savings addition'),(158,4,10.00,'2024-04-14 12:22:10','User topped up'),(159,6,10.00,'2024-04-14 12:29:19','User topped up'),(160,6,200.00,'2024-04-14 12:31:58','User topped up'),(161,6,-25.00,'2024-04-14 12:32:08','Transfer of $25 to DomantasK'),(162,2,25.00,'2024-04-14 12:32:08','Received $25 from user ID 6'),(163,6,-50.00,'2024-04-14 12:32:22','Deducted for savings addition'),(164,3,50.00,'2024-04-14 22:14:30','User topped up');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `balance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'JohnDoe',720.00,'nojusnoah@gmail.com','0838450607','Whitehall House, Parkmore',NULL),(2,'DomantasK',1182.00,NULL,NULL,NULL,NULL),(3,'testingbox',259.00,'whatever@gmail.com','0834593405','krakow csrkow3','fartbox'),(4,'noahsink',10.00,'asdasD@gmail.com','08384503928','dublin 1','test'),(5,'test123',0.00,'whatever@gmail.com','0837430392','carlow','test'),(6,'test2',135.00,'grand@asd.com','0383726284','dublin 2','test');
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

-- Dump completed on 2024-04-14 23:50:48
