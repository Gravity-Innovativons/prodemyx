-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 08, 2025 at 07:09 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `prodemyx`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Data Science', NULL, '2025-12-04 10:40:37'),
(2, 'Web Development', NULL, '2025-12-04 10:40:50'),
(3, 'Data Analysis', NULL, '2025-12-04 10:41:02');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) UNSIGNED NOT NULL,
  `category_id` int(11) UNSIGNED DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `short_description` varchar(255) DEFAULT NULL,
  `long_description` text DEFAULT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `zoom_link` varchar(255) DEFAULT NULL,
  `instructor_id` int(11) DEFAULT NULL,
  `status` enum('draft','published') DEFAULT 'draft',
  `file` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `category_id`, `title`, `description`, `short_description`, `long_description`, `duration`, `price`, `photo`, `zoom_link`, `instructor_id`, `status`, `file`, `created_at`) VALUES
(1, 1, 'Python', NULL, 'Python is a computer programming language often used to build websites and software, automate tasks, and analyse data', 'Python is a computer programming language often used to build websites and software, automate tasks, and analyse data. Python is a general-purpose language, not specialised for any specific problems, and used to create various programmes.', NULL, 45000.00, '/uploads/course-covers/1764844922304-35829762.png', 'https://www.google.com', 1, 'published', '/uploads/materials/1764844946364-208185565.pdf', '2025-12-04 10:42:30'),
(2, 2, 'HTML', NULL, 'ypertext Markup Language is the standard markup language for documents designed to be displayed in a web browser.', 'Hypertext Markup Language is the standard markup language for documents designed to be displayed in a web browser. It defines the content and structure of web content. It is often assisted by technologies such as Cascading Style Sheets and scripting languages such as JavaScript.', NULL, 15000.00, '/uploads/course-covers/1764844993480-63626429.png', 'https://www.google.com/', 1, 'published', '/uploads/materials/1764845022728-516475753.pdf', '2025-12-04 10:43:46'),
(3, 1, 'Java', NULL, 'Java is a popular, high-level, object-oriented programming language used to build a wide range of applications, from mobile and web to enterprise and IoT software', 'Java is a popular, high-level, object-oriented programming language used to build a wide range of applications, from mobile and web to enterprise and IoT software. Its \"Write Once, Run Anywhere\" capability means that Java code can run on any device that has a Java Virtual Machine (JVM) installed. The two main components of the Java platform are the Java API and the JVM, which translates Java code into machine language.', NULL, 7500.00, '/uploads/course-covers/1764847398512-47930617.png', 'https://www.google.com/', 1, 'published', '/uploads/materials/1764847424144-114117473.pdf', '2025-12-04 11:23:48'),
(4, 3, 'SQL', NULL, 'SQL is an acronym for Structured Query Language. It is the standard language used to interact with and manage data in a relational database management system (RDBMS). ', 'SQL is a domain-specific, standardized programming language that allows users to perform various operations on structured data stored in tables (rows and columns). It uses intuitive, English-like commands (such as SELECT, INSERT, UPDATE, and DELETE) to retrieve, manipulate, and define data, making it relatively easy to learn and widely used across industries. ', NULL, 1499.99, '/uploads/course-covers/1764910313813-793157727.png', 'https://www.google.com', 1, 'published', '/uploads/materials/1764910333105-883934534.pdf', '2025-12-05 04:52:17'),
(5, 1, 'BCA', NULL, 'BCA\" can stand for Bachelor of Computer Applications, a three-year undergraduate degree in computer science.', '\"BCA\" can stand for Bachelor of Computer Applications, a three-year undergraduate degree in computer science. It can also refer to the Bihar Cricket Association, an organization for cricket in the state of Bihar, India. In a scientific or biochemical context, it can stand for bicinchoninic acid, which is used in the BCA protein assay. Finally, it is the name of Bank Central Asia, a large Indonesian bank. ', NULL, 25000.00, '/uploads/course-covers/1764910746065-550188499.png', 'https://www.google.com', 1, 'published', '/uploads/materials/1764910763779-885654515.pdf', '2025-12-05 04:59:28');

-- --------------------------------------------------------

--
-- Table structure for table `course_schedules`
--

CREATE TABLE `course_schedules` (
  `id` int(11) UNSIGNED NOT NULL,
  `course_id` int(11) UNSIGNED NOT NULL,
  `instructor_id` int(11) UNSIGNED DEFAULT NULL,
  `meeting_title` varchar(255) NOT NULL,
  `meeting_schedule` enum('Morning','Evening','Weekend') DEFAULT NULL,
  `meeting_link` varchar(500) DEFAULT NULL,
  `meeting_date` date NOT NULL,
  `meeting_time` time NOT NULL,
  `status` enum('scheduled','completed','cancelled') DEFAULT 'scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` int(11) UNSIGNED NOT NULL,
  `user_id` int(11) UNSIGNED DEFAULT NULL,
  `course_id` int(11) UNSIGNED DEFAULT NULL,
  `payment_id` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','success','failed') DEFAULT 'pending',
  `purchase_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (`id`, `user_id`, `course_id`, `payment_id`, `amount`, `status`, `purchase_date`) VALUES
(1, 2, 3, 'pay_Rno942i8a0ajtW', 7500.00, 'success', '2025-12-05 05:03:34'),
(2, 2, 4, 'pay_Rno942i8a0ajtW', 1499.99, 'success', '2025-12-05 05:03:34'),
(3, 2, 5, 'pay_Rno942i8a0ajtW', 25000.00, 'success', '2025-12-05 05:03:34');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) UNSIGNED NOT NULL,
  `name` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `role` enum('admin','instructor','student') NOT NULL DEFAULT 'student',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `address`, `role`, `created_at`) VALUES
(1, 'Isabel Johnson', 'isabeljohnson003@gmail.com', '$2b$10$o.LIMlwqGqrpfMTCFOSaYe8GC1UsRiQJEmW3gJH6mik5SqagQLE1K', NULL, NULL, 'instructor', '2025-12-04 10:39:09'),
(2, 'Keerthy  Krishna', 'keerthykrishna2510@gmail.com', '$2b$10$x663dTgtR4Y1ECz8Bmzr1ePDgD.tgaDTXbxfOD/hc47xG8KpuBUmC', NULL, NULL, 'student', '2025-12-04 10:39:40'),
(3, 'admin gravity', 'admin@gmail.com', '$2b$10$q3opIhuFGSygYyVuPa2Lu.oJbdLJkzz8lRXigYwwiGl6S6ehimX9G', NULL, NULL, 'admin', '2025-12-04 10:40:14'),
(4, 'Isabel johnson', 'isabeljohnson0003@gmail.com', '$2b$10$LTC3bRRJJtRxcy6.JYjLwOfMaLIa0gyRxgU/d0Hy3Fdg50Tud6tKS', '08281272193', NULL, 'student', '2025-12-04 11:20:33');

-- --------------------------------------------------------

--
-- Table structure for table `user_course_access`
--

CREATE TABLE `user_course_access` (
  `id` int(11) UNSIGNED NOT NULL,
  `user_id` int(11) UNSIGNED DEFAULT NULL,
  `course_id` int(11) UNSIGNED DEFAULT NULL,
  `access_granted_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_course_access`
--

INSERT INTO `user_course_access` (`id`, `user_id`, `course_id`, `access_granted_date`) VALUES
(1, 2, 3, '2025-12-05 05:03:34'),
(2, 2, 4, '2025-12-05 05:03:34'),
(3, 2, 5, '2025-12-05 05:03:34');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `course_schedules`
--
ALTER TABLE `course_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `instructor_id` (`instructor_id`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_unique` (`email`);

--
-- Indexes for table `user_course_access`
--
ALTER TABLE `user_course_access`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `course_id` (`course_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `course_schedules`
--
ALTER TABLE `course_schedules`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_course_access`
--
ALTER TABLE `user_course_access`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Constraints for table `course_schedules`
--
ALTER TABLE `course_schedules`
  ADD CONSTRAINT `course_schedules_course_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `course_schedules_instructor_fk` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `purchases_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);

--
-- Constraints for table `user_course_access`
--
ALTER TABLE `user_course_access`
  ADD CONSTRAINT `user_course_access_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `user_course_access_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
