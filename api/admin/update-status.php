<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(["error" => "Method not allowed"], 405);
}

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->order_id) && !empty($data->status)) {
    try {
        $query = "UPDATE orders SET status = :status WHERE id = :order_id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':status', $data->status);
        $stmt->bindParam(':order_id', $data->order_id);

        if ($stmt->execute()) {
            sendResponse(["message" => "Order status updated successfully"]);
        } else {
            sendResponse(["error" => "Update failed"], 500);
        }
    } catch (PDOException $e) {
        sendResponse(["error" => $e->getMessage()], 500);
    }
} else {
    sendResponse(["error" => "Incomplete data"], 400);
}
?>
