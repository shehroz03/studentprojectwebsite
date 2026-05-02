<?php
require_once '../config.php';

// Fetch all orders with user names for admin
try {
    $query = "SELECT o.*, u.name as student_name, u.email as student_email 
              FROM orders o 
              JOIN users u ON o.user_id = u.id 
              ORDER BY o.created_at DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse($orders);
} catch (PDOException $e) {
    sendResponse(["error" => $e->getMessage()], 500);
}
?>
