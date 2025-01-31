<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up for Profile - Profile Hub</title>
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
        <h2 class="text-center mb-4">Sign Up for Profile</h2>
        <div class="card p-4 shadow-lg">
            <form action="process.php" method="POST">
                <!-- Honeypot field (hidden from users) -->
                <div style="display:none;">
                    <label for="honeypot">Leave this field empty</label>
                    <input type="text" id="honeypot" name="honeypot">
                </div>

                <div class="row">
                    <div class="mb-3 col-md-6">
                        <label for="first_name" class="form-label">First Name*</label>
                        <input type="text" class="form-control" id="first_name" name="first_name" placeholder="Enter your first name">
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="last_name" class="form-label">Last Name*</label>
                        <input type="text" class="form-control" id="last_name" name="last_name" placeholder="Enter your last name">
                    </div>
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">Email Address*</label>
                    <input type="email" class="form-control" id="email" name="email" placeholder="Enter your email">
                </div>
                <div class="mb-3">
                    <label for="phone_number" class="form-label">Phone Number</label>
                    <input type="text" class="form-control" id="phone_number" name="phone_number" placeholder="Enter your phone number">
                </div>
                <div class="row">
                    <div class="mb-3 col-md-6">
                        <label for="password" class="form-label">Password*</label>
                        <input type="password" class="form-control" id="password" name="password" placeholder="Use A-Z, a-z, 0-9, !@#$%^&* in password">
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="re_password" class="form-label">Re-Password*</label>
                        <input type="password" class="form-control" id="re_password" name="re_password" placeholder="Re-enter your password">
                    </div>
                </div>
                <div class="mb-3">
                    <label for="dob" class="form-label">Date of Birth</label>
                    <input type="date" class="form-control" id="dob" name="dob">
                </div>
                <div class="row">
                    <div class="mb-3 col-md-6">
                        <label for="city" class="form-label">City</label>
                        <input type="text" class="form-control" id="city" name="city" placeholder="City">
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="state" class="form-label">State</label>
                        <input type="text" class="form-control" id="state" name="state" placeholder="State">
                    </div>
                </div>
                <button id="submit" type="submit" class="btn btn-primary w-100">Sign Up</button>
            </form>
        </div>
    </div>

    <!-- script for bot -->
    <script>
        let mouseMoved = false;

        // Tracking mouse movement
        document.addEventListener('mousemove', () => {
            mouseMoved = true;
        });

        // Track form submission
        document.querySelector('form').addEventListener('submit', function(e) {
            // If mouse wasn't moved, a bot
            if (!mouseMoved) {
                alert('Suspicious activity detected: Mouse movement is absent.');
                e.preventDefault();
            }

            // Checking for honeypot field
            if (document.getElementById('honeypot').value !== '') {
                alert('Bot activity detected: Honeypot field was filled.');
                e.preventDefault();
            }
        });
    </script>
    <script>

</body>
</html>
<?php
// Check if honeypot field is filled
if (!empty($_POST['honeypot'])) {
    die('Bot activity detected: Honeypot field was filled.');
}


?>