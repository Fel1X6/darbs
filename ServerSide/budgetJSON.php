<?php
session_start();
if(!isset($_SESSION['usr'])){ echo "Session ended!"; exit;}

include('cnf.php');
include('core.php');

$conn = ConnectDB();
escape_deep($_POST, $conn);
CloseDB($conn);

if(isset($_POST['fName'])){
    if($_POST['fName'] === 'loadVessels') loadVessels();
    if($_POST['fName'] === 'loadRanks') loadRanks($_POST['mi'] ?? []);
    if($_POST['fName'] === 'loadRankData') loadRankData($_POST['mi'] ?? []);
}

function loadVessels(){
    $conn = ConnectDB();
    $arr = [];
    $arr['answer'] = 'error';
    $arr['vessels'] = [];

    if($_SESSION['usr_role'] == 'admin'){
        $q = mysqli_query($conn, "SELECT * FROM `budget_vessel` WHERE `is_active` = 1 ORDER BY `vessel_name`");
    } else {
        $company_guid = mysqli_real_escape_string($conn, $_SESSION['usr_company_guid']);

        $q = mysqli_query($conn, "SELECT * FROM `budget_vessel` WHERE `is_active` = 1 AND `company_guid` = '".$company_guid."' ORDER BY `vessel_name`");
    }

    while($row = mysqli_fetch_assoc($q)){
        $arr['vessels'][] = $row;
    }

    $arr['answer'] = 'ok';

    array_walk_recursive($arr, "convert_before_json");
    echo json_encode($arr);
    CloseDB($conn);
}

function loadRanks($mi){
    $conn = ConnectDB();
    $arr = [];
    $arr['answer'] = 'ok';
    $arr['ranks'] = [];

    $vessel_guid = mysqli_real_escape_string($conn, $mi['vessel_guid']);
    $company_guid = mysqli_real_escape_string($conn, $_SESSION['usr_company_guid']);

    $q = mysqli_query($conn, "SELECT `vessel_type` FROM `budget_vessel` WHERE `guid` = '".$vessel_guid."'");

    $vessel = mysqli_fetch_assoc($q);
    $vessel_type = mysqli_real_escape_string($conn, $vessel['vessel_type']);

    if($_SESSION['usr_role'] == 'admin'){
        $q = mysqli_query($conn, "SELECT `budget_rank_salary`.`guid`, `budget_rank`.`rank_name` FROM `budget_rank_salary` LEFT JOIN `budget_rank` ON `budget_rank`.`id` = `budget_rank_salary`.`rank_id`
            WHERE `budget_rank_salary`.`vessel_type` = '".$vessel_type."' AND `budget_rank_salary`.`is_active` = 1 ORDER BY `budget_rank`.`rank_name`");
    } else {
        $q = mysqli_query($conn, "SELECT `budget_rank_salary`.`guid`, `budget_rank`.`rank_name` FROM `budget_rank_salary` LEFT JOIN `budget_rank` ON `budget_rank`.`id` = `budget_rank_salary`.`rank_id`
            WHERE `budget_rank_salary`.`company_guid` = '".$company_guid."' AND `budget_rank_salary`.`vessel_type` = '".$vessel_type."' AND `budget_rank_salary`.`is_active` = 1
            ORDER BY `budget_rank`.`rank_name`");
    }

    while($row = mysqli_fetch_assoc($q)){
        $arr['ranks'][] = $row;
    }

    array_walk_recursive($arr, "convert_before_json");
    echo json_encode($arr);
    CloseDB($conn);
}

function loadRankData($mi){
    $conn = ConnectDB();
    $arr = [];
    $arr['answer'] = 'ok';
    $arr['rank'] = [];

    $guid = mysqli_real_escape_string($conn, $mi['guid']);

    $q = mysqli_query($conn, "SELECT `budget_rank_salary`.*, `budget_rank`.`rank_name` FROM `budget_rank_salary` LEFT JOIN `budget_rank` ON `budget_rank`.`id` = `budget_rank_salary`.`rank_id` WHERE `budget_rank_salary`.`guid` = '".$guid."'");

    $row = mysqli_fetch_assoc($q);
    $row['other_additions'] = $row['other_amount'];
    $row['deductions'] = 0;

    $arr['rank'] = $row;

    array_walk_recursive($arr, "convert_before_json");
    echo json_encode($arr);
    CloseDB($conn);
}
