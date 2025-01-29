-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 28, 2025 at 11:18 PM
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
-- Database: `lifely`
--

-- --------------------------------------------------------

--
-- Table structure for table `diary_entries`
--

CREATE TABLE `diary_entries` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `mood` enum('sad','angry','neutral','happy','very happy') DEFAULT 'neutral',
  `date` datetime NOT NULL,
  `is_archived` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(11) NOT NULL,
  `migration_name` varchar(255) NOT NULL,
  `executed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration_name`, `executed_at`) VALUES
(1, 'InitialSchema', '2025-01-28 16:03:56'),
(2, 'TasksSchema', '2025-01-28 16:03:56'),
(3, 'SubtasksSchema', '2025-01-28 16:03:57'),
(4, 'DiarySchema', '2025-01-28 16:03:57'),
(5, 'AddArchivedToTasks', '2025-01-28 16:03:57'),
(6, 'VerificationSchema', '2025-01-28 16:08:20'),
(7, '001_users_schema.php', '2025-01-28 22:08:57'),
(8, '002_tasks_schema.php', '2025-01-28 22:11:10'),
(9, '003_subtasks_schema.php', '2025-01-28 22:11:10'),
(10, '004_diary_schema.php', '2025-01-28 22:11:10'),
(11, '001_initial_schema.php', '2025-01-28 22:13:04');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reset_tokens`
--

CREATE TABLE `reset_tokens` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `used` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reset_tokens`
--

INSERT INTO `reset_tokens` (`id`, `email`, `token`, `expires_at`, `created_at`, `used`) VALUES
(2, 'yannahwatanabe794@gmail.com', 'c07f7bda08b03ec9890981c6362fca617b00e76c154fb2ff8f2e2d61cbc8ea33', '2025-01-28 20:13:46', '2025-01-28 19:13:46', 1);

-- --------------------------------------------------------

--
-- Table structure for table `subtasks`
--

CREATE TABLE `subtasks` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subtasks`
--

INSERT INTO `subtasks` (`id`, `task_id`, `title`, `is_completed`, `created_at`, `updated_at`) VALUES
(1, 5, 'subtask 1', 0, '2025-01-28 20:37:43', '2025-01-28 20:38:16'),
(2, 6, 'subomoto', 0, '2025-01-28 20:40:19', '2025-01-28 20:40:19'),
(3, 4, 'draghon', 0, '2025-01-28 20:40:58', '2025-01-28 20:40:58'),
(4, 2, 'dasdada', 0, '2025-01-28 21:20:57', '2025-01-28 21:20:57'),
(5, 3, 'sdadada', 0, '2025-01-28 21:36:00', '2025-01-28 21:36:00'),
(6, 3, 'oo naman', 0, '2025-01-28 21:36:13', '2025-01-28 21:36:13'),
(7, 3, 'sige try ko nga', 1, '2025-01-28 21:38:45', '2025-01-28 21:38:46');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `list_type` enum('personal','work','school') NOT NULL,
  `priority` enum('high','medium','low') NOT NULL,
  `reminder_date` datetime DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `is_archived` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `user_id`, `title`, `description`, `list_type`, `priority`, `reminder_date`, `is_completed`, `is_archived`, `created_at`, `updated_at`) VALUES
(1, 1, 'lami ka gyud', '', 'personal', 'low', NULL, 0, 1, '2025-01-28 16:51:02', '2025-01-28 17:02:17'),
(2, 2, 'hi!', '', 'personal', 'low', NULL, 0, 0, '2025-01-28 17:29:14', '2025-01-28 17:29:14'),
(3, 2, 'nagana ba search?', '', 'school', 'high', '2025-02-01 00:00:00', 0, 0, '2025-01-28 17:30:32', '2025-01-28 21:20:10'),
(4, 1, 'dadada', '', 'work', 'low', '2025-01-31 00:00:00', 0, 0, '2025-01-28 19:59:13', '2025-01-28 20:34:58'),
(5, 1, 'weweqewq', '', 'personal', 'low', '2025-01-29 00:00:00', 0, 0, '2025-01-28 20:25:15', '2025-01-28 20:26:15'),
(6, 1, 'loh keng', '', 'school', 'high', NULL, 0, 0, '2025-01-28 20:37:23', '2025-01-28 20:37:23'),
(7, 2, 'fucckkk', '', 'school', 'low', '2025-02-01 00:00:00', 0, 0, '2025-01-28 20:51:26', '2025-01-28 21:39:10');

-- --------------------------------------------------------

--
-- Table structure for table `task_notes`
--

CREATE TABLE `task_notes` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `note` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `task_notes`
--

INSERT INTO `task_notes` (`id`, `task_id`, `note`, `created_at`, `updated_at`) VALUES
(1, 5, 'stickyyynigga', '2025-01-28 20:34:32', '2025-01-28 20:38:08'),
(2, 4, 'geh\n', '2025-01-28 20:35:00', '2025-01-28 20:41:42'),
(3, 6, 'jesus help me ', '2025-01-28 20:40:11', '2025-01-28 20:40:37'),
(4, 7, 'Hi lifelyz', '2025-01-28 20:51:28', '2025-01-28 20:51:31'),
(5, 3, 'ge nigga', '2025-01-28 21:03:15', '2025-01-28 21:03:15');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `profile_image` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `created_at`, `updated_at`, `last_login`, `status`, `profile_image`, `reset_token`, `reset_token_expiry`) VALUES
(1, 'jejemon1', 'freyalaluce@gmail.com', '$2y$10$6cCDSPYfZ9Li/heLp1xqieRoo49VpfVwoPmMeBT5xCjM.gHba1iCK', '2025-01-28 16:50:39', '2025-01-28 16:50:39', NULL, 'active', NULL, NULL, NULL),
(2, 'jesustakethewheel', 'yannahwatanabe794@gmail.com', '$2y$10$zqprt.tMFC9hxeWlcdvmou0yOoZi5IJQrv4h2.2ysjKZwAtnlSTlu', '2025-01-28 17:14:20', '2025-01-28 19:14:10', NULL, 'active', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `session_token`, `expires_at`, `created_at`) VALUES
(1, 1, '99d6ecf16f996fe0c332aa67c8d481d82c43a3dd72b4a265747ce13bb8f4338f', '2025-01-29 09:50:52', '2025-01-28 16:50:52'),
(2, 1, '636445459d85b3f59224608c753fb9ac296dcdb9904ca1c5ea774ded816dafc0', '2025-01-29 10:01:39', '2025-01-28 17:01:39'),
(3, 2, '57dd1f9dc26473afe8d739ac3490c6ed67c1e145d70b1d15fb24fc69a0ee65c7', '2025-01-29 10:14:37', '2025-01-28 17:14:37'),
(4, 2, 'ef40963363378dbf84af0296e22dccd4c83534d18f5aa41d99bdedba8e2b0370', '2025-01-29 10:33:41', '2025-01-28 17:33:41'),
(5, 2, '58d1137125f77048ba6f0bdf74c7f39fb297b3d1ba45b8c2f09d88699af70b28', '2025-01-29 11:01:21', '2025-01-28 18:01:21'),
(6, 2, 'b474b4a13fddfbfdc8c146052b847d824690492f23857aeda6ba1a9af01e4d65', '2025-01-29 12:14:24', '2025-01-28 19:14:24'),
(7, 2, '9b714dafeb091d0fd73e263a13a129040ae4744d6f98a7dd633274b1a0d3f7fc', '2025-01-29 12:18:59', '2025-01-28 19:18:59'),
(8, 1, 'b86decd36bc9f978202b9b2877b27b9a777e8916a42e74c82add1c01869f7c44', '2025-01-29 12:19:26', '2025-01-28 19:19:26'),
(9, 2, '603e199a098a7137afbe0845205c3b6b8291ed25bc151ece175751b40c6c0d63', '2025-01-29 13:49:06', '2025-01-28 20:49:06');

-- --------------------------------------------------------

--
-- Table structure for table `verifications`
--

CREATE TABLE `verifications` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `verified` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `verifications`
--

INSERT INTO `verifications` (`id`, `email`, `otp`, `expires_at`, `created_at`, `verified`) VALUES
(2, 'freyalaluce@gmail.com', '548240', '2025-01-28 18:02:26', '2025-01-28 16:47:26', 1),
(3, 'yannahwatanabe794@gmail.com', '421052', '2025-01-28 18:28:45', '2025-01-28 17:13:45', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `diary_entries`
--
ALTER TABLE `diary_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_date` (`user_id`,`date`),
  ADD KEY `idx_archived` (`is_archived`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `reset_tokens`
--
ALTER TABLE `reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_token` (`token`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `subtasks`
--
ALTER TABLE `subtasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `task_notes`
--
ALTER TABLE `task_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_username` (`username`),
  ADD KEY `idx_users_status` (`status`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `verifications`
--
ALTER TABLE `verifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `diary_entries`
--
ALTER TABLE `diary_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reset_tokens`
--
ALTER TABLE `reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `subtasks`
--
ALTER TABLE `subtasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `task_notes`
--
ALTER TABLE `task_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_profiles`
--
ALTER TABLE `user_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `verifications`
--
ALTER TABLE `verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `diary_entries`
--
ALTER TABLE `diary_entries`
  ADD CONSTRAINT `diary_entries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subtasks`
--
ALTER TABLE `subtasks`
  ADD CONSTRAINT `subtasks_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `task_notes`
--
ALTER TABLE `task_notes`
  ADD CONSTRAINT `task_notes_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
