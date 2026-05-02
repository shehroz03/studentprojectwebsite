<?php
require_once '../config.php';

// Fetch orders for a specific user
$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    sendResponse(["error" => "User ID required"], 400);
}

try {
    $query = "SELECT * FROM orders WHERE user_id = :user_id ORDER BY created_at DESC";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();

    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse($orders);
} catch (PDOException $e) {
    sendResponse(["error" => $e->getMessage()], 500);
}
?>
