<?php
require 'db.php'; session_start();
if($_SERVER['REQUEST_METHOD']!=='POST') exit;
$name=trim($_POST['name']??''); $email=filter_var($_POST['email']??'',FILTER_VALIDATE_EMAIL); $password=$_POST['password']??'';
if(!$name||!$email||strlen($password)<6) exit('Please provide a name, valid email, and a password of at least 6 characters.');
try{$stmt=$pdo->prepare('INSERT INTO users (name,email,password) VALUES (?,?,?)');$stmt->execute([$name,$email,password_hash($password,PASSWORD_DEFAULT)]);$_SESSION['user_id']=$pdo->lastInsertId();$_SESSION['name']=$name;header('Location: ../dashboard.html?name='.urlencode($name));}catch(PDOException $e){exit('An account with this email may already exist.');}
?>
