<?php
require_once '../config.php';

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(["error" => "Method not allowed"], 405);
}

// Get user ID (In production, verify token/session)
$user_id = $_POST['user_id'] ?? null;
$title = $_POST['title'] ?? null;
$description = $_POST['description'] ?? null;
$deadline = $_POST['deadline'] ?? null;
$budget = $_POST['budget'] ?? null;

if (!$user_id || !$title) {
    sendResponse(["error" => "Required fields missing"], 400);
}

$file_name = "";
if (isset($_FILES['file'])) {
    $target_dir = "../../uploads/";
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0777, true);
    }
    $file_name = time() . "_" . basename($_FILES["file"]["name"]);
    $target_file = $target_dir . $file_name;
    
    if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
        // File uploaded
    } else {
        sendResponse(["error" => "File upload failed"], 500);
    }
}

try {
    $query = "INSERT INTO orders (user_id, title, description, deadline, budget, file) 
              VALUES (:user_id, :title, :description, :deadline, :budget, :file)";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':deadline', $deadline);
    $stmt->bindParam(':budget', $budget);
    $stmt->bindParam(':file', $file_name);

    if ($stmt->execute()) {
        sendResponse(["message" => "Order created successfully", "order_id" => $conn->lastInsertId()], 201);
    } else {
        sendResponse(["error" => "Failed to create order"], 500);
    }
} catch (PDOException $e) {
    sendResponse(["error" => $e->getMessage()], 500);
}
?>
