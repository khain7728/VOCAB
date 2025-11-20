<?php
// Tắt báo lỗi ra màn hình để không hỏng JSON
error_reporting(0);
mysqli_report(MYSQLI_REPORT_OFF);

$servername = "localhost";
$username = "root";
$password = ""; 
$dbname = "english_learning"; 

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    header('Content-Type: application/json');
    die(json_encode(['status' => 'error', 'message' => 'Kết nối DB thất bại: ' . $conn->connect_error]));
}
$conn->set_charset("utf8");
?>