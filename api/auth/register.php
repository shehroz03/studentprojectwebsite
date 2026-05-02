<?php
require_once '../config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name) && !empty($data->email) && !empty($data->password)) {
    try {
        // Check if email already exists
        $check_query = "SELECT id FROM users WHERE email = :email";
    $check_stmt = $conn->prepare($check_query);
    $check_stmt->bindParam(':email', $data->email);
    $check_stmt->execute();

    if ($check_stmt->rowCount() > 0) {
        sendResponse(["error" => "Email already registered"], 400);
    }

    $query = "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, 'user')";
    $stmt = $conn->prepare($query);

    $stmt->bindParam(':name', $data->name);
    $stmt->bindParam(':email', $data->email);
    
    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
    $stmt->bindParam(':password', $password_hash);

    if ($stmt->execute()) {
        sendResponse(["message" => "User registered successfully"], 201);
    } else {
        $errorInfo = $stmt->errorInfo();
        sendResponse(["error" => "Registration failed: " . $errorInfo[2]], 500);
    }
} catch (PDOException $e) {
    sendResponse(["error" => "Database error: " . $e->getMessage()], 500);
}
} else {
    sendResponse(["error" => "Incomplete data"], 400);
}
?>
