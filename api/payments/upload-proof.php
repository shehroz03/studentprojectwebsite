<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(["error" => "Method not allowed"], 405);
}

$user_id = $_POST['user_id'] ?? null;
$order_id = $_POST['order_id'] ?? null;
$amount = $_POST['amount'] ?? 0;

if (!$user_id || !$order_id) {
    sendResponse(["error" => "Required fields missing"], 400);
}

$proof_image = "";
if (isset($_FILES['proof'])) {
    $target_dir = "../../uploads/payments/";
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0777, true);
    }
    $proof_image = "payment_" . time() . "_" . basename($_FILES["proof"]["name"]);
    $target_file = $target_dir . $proof_image;
    
    if (move_uploaded_file($_FILES["proof"]["tmp_name"], $target_file)) {
        // Image uploaded
    } else {
        sendResponse(["error" => "Image upload failed"], 500);
    }
} else {
    sendResponse(["error" => "Payment proof image required"], 400);
}

try {
    $query = "INSERT INTO payments (user_id, order_id, amount, proof_image, status) 
              VALUES (:user_id, :order_id, :amount, :proof_image, 'pending')";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':order_id', $order_id);
    $stmt->bindParam(':amount', $amount);
    $stmt->bindParam(':proof_image', $proof_image);

    if ($stmt->execute()) {
        sendResponse(["message" => "Payment proof uploaded successfully"], 201);
    } else {
        sendResponse(["error" => "Failed to save payment proof"], 500);
    }
} catch (PDOException $e) {
    sendResponse(["error" => $e->getMessage()], 500);
}
?>
