<?php
// establishing the  connection
$conn = new mysqli("localhost", "root", "", "playwright_form_db");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

//fetching users here
$sql = "SELECT * FROM users";
$result = $conn->query($sql);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>List of All Profiles - Profile Hub</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-light ">
        <div class="container">
            <a class="navbar-brand" href="index.php">
                <span style="color:#007bff;">Profile</span> <strong>Hub</strong>
            </a>
            <div class="ms-auto">
                <a href="users.php" class="me-3 text-dark">Profiles</a>
                <a href="index.php" class="text-primary">Sign Up</a>
            </div>
        </div>
    </nav>
    <hr>
    <div class="container mt-5">
        <h2 class="text-center mb-4">List of all Profiles</h2>
        <div class="card p-4 shadow-lg">
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>#</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                            <th>Password</th>
                            <th>DOB</th>
                            <th>City</th>
                            <th>State</th>
                        
                        </tr>
                    </thead>
                    <tbody>
                        <?php $sno = 1; while ($row = $result->fetch_assoc()): ?>
                        <tr>
                       
        
                            <td><?= $sno++ ?></td>
                            <td><?= htmlspecialchars($row['first_name']) ?></td>
                            <td><?= htmlspecialchars($row['last_name']) ?></td>
                            <td><?= htmlspecialchars($row['email']) ?></td>
                            <td><?= htmlspecialchars($row['phone_number']) ?></td>
                            <td><?= htmlspecialchars($row['password']) ?></td>
                            <td><?= htmlspecialchars($row['dob']) ?></td>
                            <td><?= htmlspecialchars($row['city']) ?></td>
                            <td><?= htmlspecialchars($row['state']) ?></td>
            
                        </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
<?php
$conn->close();
?>
<style>
    body {
        background-color: #f0f2f5;
        font-family: 'Arial', sans-serif;
    }

    .navbar {
        padding: 15px 0;
    }

    .navbar-brand {
        font-size: 1.5rem;
        font-weight: bold;
    }

    .navbar a {
        text-decoration: none;
    }

    .card {
        border-radius: 10px;
        border: none;
        background-color: #fff;
    }

    h2 {
        font-weight: bold;
    }

    table {
        text-align: center;
    }

    th, td {
        vertical-align: middle;
    }

    th {
        font-weight: bold;
    }
</style>
