<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(["error" => "Method not allowed"], 405);
}

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->sender_id) && !empty($data->receiver_id) && !empty($data->message)) {
    try {
        $query = "INSERT INTO messages (sender_id, receiver_id, message) VALUES (:sender_id, :receiver_id, :message)";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':sender_id', $data->sender_id);
        $stmt->bindParam(':receiver_id', $data->receiver_id);
        $stmt->bindParam(':message', $data->message);

        if ($stmt->execute()) {
            sendResponse(["message" => "Message sent successfully"], 201);
        } else {
            sendResponse(["error" => "Failed to send message"], 500);
        }
    } catch (PDOException $e) {
        sendResponse(["error" => $e->getMessage()], 500);
    }
} else {
    sendResponse(["error" => "Incomplete data"], 400);
}
?>
