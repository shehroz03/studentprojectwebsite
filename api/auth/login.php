<?php
require_once '../config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    // Email format validation
    if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
        sendResponse(["error" => "Please enter a valid email address"], 400);
    }

    $query = "SELECT id, name, email, password, role FROM users WHERE email = :email LIMIT 0,1";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':email', $data->email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (password_verify($data->password, $row['password'])) {
            // For simple implementation, we return user data.
            // In production, use JWT or secure sessions.
            unset($row['password']);
            sendResponse([
                "message" => "Login successful",
                "user" => $row
            ]);
        } else {
            sendResponse(["error" => "Invalid credentials"], 401);
        }
    } else {
        sendResponse(["error" => "User not found"], 404);
    }
} else {
    sendResponse(["error" => "Incomplete data"], 400);
}
?>
