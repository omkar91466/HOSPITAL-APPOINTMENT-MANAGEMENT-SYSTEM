<?php
require 'db.php'; session_start();
if($_SERVER['REQUEST_METHOD']!=='POST') exit;
$stmt=$pdo->prepare('SELECT id,name,password FROM users WHERE email=?');$stmt->execute([$_POST['email']??'']);$user=$stmt->fetch(PDO::FETCH_ASSOC);
if(!$user||!password_verify($_POST['password']??'',$user['password'])) exit('Invalid email or password.');
$_SESSION['user_id']=$user['id'];$_SESSION['name']=$user['name'];header('Location: ../dashboard.html?name='.urlencode($user['name']));
?>
