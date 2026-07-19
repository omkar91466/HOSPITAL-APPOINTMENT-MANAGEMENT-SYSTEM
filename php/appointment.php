<?php
require 'db.php';session_start();if(empty($_SESSION['user_id'])){header('Location: ../login.html');exit;}
$doctor=(int)($_POST['doctor_id']??0);$date=$_POST['appointment_date']??'';
if(!$doctor||!$date) exit('Please choose a doctor and appointment time.');
$stmt=$pdo->prepare('INSERT INTO appointments (user_id,doctor_id,appointment_date) VALUES (?,?,?)');$stmt->execute([$_SESSION['user_id'],$doctor,date('Y-m-d H:i:s',strtotime($date))]);header('Location: ../dashboard.html?name='.urlencode($_SESSION['name']));
?>
