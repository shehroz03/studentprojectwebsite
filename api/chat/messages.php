<?php
require_once '../config.php';

$user1 = $_GET['user1'] ?? null;
$user2 = $_GET['user2'] ?? null;

if (!$user1 || !$user2) {
    sendResponse(["error" => "User IDs required"], 400);
}

try {
    $query = "SELECT * FROM messages 
              WHERE (sender_id = :u1 AND receiver_id = :u2) 
              OR (sender_id = :u2 AND receiver_id = :u1) 
              ORDER BY created_at ASC";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':u1', $user1);
    $stmt->bindParam(':u2', $user2);
    $stmt->execute();

    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse($messages);
} catch (PDOException $e) {
    sendResponse(["error" => $e->getMessage()], 500);
}
?>
