<?php
//establishing database
$conn = new mysqli("localhost", "root", "", "playwright_form_db");

// Checking
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Handling form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitizing and validate inputs
    $first_name = trim(htmlspecialchars($_POST['first_name']));
    $last_name = trim(htmlspecialchars($_POST['last_name']));
    $email = trim(htmlspecialchars($_POST['email']));
    $password = trim($_POST['password']);
    $re_password = trim($_POST['re_password']);
    $phone_number = isset($_POST['phone_number']) ? trim($_POST['phone_number']) : null;
    $dob = isset($_POST['dob']) ? trim($_POST['dob']) : null;
    $city = isset($_POST['city']) ? trim(htmlspecialchars($_POST['city'])) : null;
    $state = isset($_POST['state']) ? trim(htmlspecialchars($_POST['state'])) : null;

    // Initializing error array
    $errors = [];

    // Edge cases 
    if (strlen($first_name) > 50) {
        $errors[] = ["id" => "first_name_length_error", "message" => "First name must be 50 characters or less."];
    }
    if (strlen($last_name) > 50) {
        $errors[] = ["id" => "last_name_length_error", "message" => "Last name must be 50 characters or less."];
    }
    if (strlen($email) > 100) {
        $errors[] = ["id" => "email_length_error", "message" => "Email must be 100 characters or less."];
    }
    if (strlen($password) > 100) {
        $errors[] = ["id" => "password_length_error", "message" => "Password must be 100 characters or less."];
    }

    // Special Characters
    if (!preg_match("/^[a-zA-Z\s]+$/", $first_name)) {
        $errors[] = ["id" => "first_name_invalid_error", "message" => "First name can only contain letters and spaces."];
    }
    if (!preg_match("/^[a-zA-Z\s]+$/", $last_name)) {
        $errors[] = ["id" => "last_name_invalid_error", "message" => "Last name can only contain letters and spaces."];
    }
    if (!preg_match("/^[a-zA-Z\s]+$/", $city)) {
        $errors[] = ["id" => "city_invalid_error", "message" => "City can only contain letters and spaces."];
    }
    if (!preg_match("/^[a-zA-Z\s]+$/", $state)) {
        $errors[] = ["id" => "state_invalid_error", "message" => "State can only contain letters and spaces."];
    }

    // Standard validations required fields
    if (empty($first_name)) $errors[] = ["id" => "first_name_error", "message" => "First name is required."];
    if (empty($last_name)) $errors[] = ["id" => "last_name_error", "message" => "Last name is required."];
    if (empty($email)) $errors[] = ["id" => "email_error", "message" => "Email is required."];
    if (empty($password)) $errors[] = ["id" => "password_error", "message" => "Password is required."];
    if ($password !== $re_password) {
        $errors[] = ["id" => "password_mismatch_error", "message" => "Password and Re-Password do not match."];
    }
    if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = ["id" => "email_format_error", "message" => "Invalid email format."];
    }
    if (!empty($password) && strlen($password) < 4) {
        $errors[] = ["id" => "password_length_error", "message" => "Password must be at least 4 characters."];
    }

    // phone no. ==10
    if (!empty($phone_number) && !preg_match('/^\d{10}$/', $phone_number)) {
        $errors[] = ["id" => "phone_number_error", "message" => "Phone number must be exactly 10 digits."];
    }
    if (!empty($dob) && (!strtotime($dob) || strtotime($dob) > time())) {
        $errors[] = ["id" => "dob_error", "message" => "Invalid or future date of birth."];
    }

    // Checking for duplicate email
    if (empty($errors)) {
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $errors[] = ["id" => "email_duplicate_error", "message" => "This email is already registered."];
        }
        $stmt->close();
    }

    // If there are any errors, then displaying them
    if (!empty($errors)) {
        echo "<div id='error-messages' style='color: red;'>";
        echo "<ul>";
        foreach ($errors as $error) {
            echo "<li id='" . $error['id'] . "'>" . $error['message'] . "</li>";
        }
        echo "</ul>";
        echo "</div>";
    } else {
        $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, password, phone_number, dob, city, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssssss", $first_name, $last_name, $email, $password, $phone_number, $dob, $city, $state);
        if ($stmt->execute()) {
            header("Location: users.php");
            exit();
        } else {
            echo "<div style='color: red;'>Error: " . $stmt->error . "</div>";
        }
        $stmt->close();
    }
}
$conn->close();
?>
