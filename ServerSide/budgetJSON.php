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
     if($_POST['fName'] === 'loadExchangeRate') loadExchangeRate($_POST['mi']);
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

function getSetting($mi){
    $conn = ConnectDB();
    $arr = [];
    $arr['answer'] = 'error';
    $arr['setting'] = [];

    if($_SESSION['usr_role'] == 'admin'){
        $company_guid = $mi['company_guid'];
    } else {
        $company_guid = $_SESSION['usr_company_guid'];
    }

    $q = mysqli_query($conn, "SELECT * FROM `budget_rank_salary` WHERE `company_guid` = '".$company_guid."' AND `vessel_type` = '".$mi['vessel_type']."' AND `rank_id` = '".$mi['rank_id']."'");

    $row = mysqli_fetch_assoc($q);

    if($row){
        $arr['answer'] = 'ok';
        $arr['setting'] = $row;
    } else {
        $arr['setting']['guid'] = '';
        $arr['setting']['required_on_board'] = 1;
        $arr['setting']['contract_months'] = 4;
        $arr['setting']['base_salary'] = 0;
        $arr['setting']['working_days'] = 30;
        $arr['setting']['daily_rate'] = 0;
        $arr['setting']['leave_pay'] = 0;
        $arr['setting']['employer_cost'] = 0;
        $arr['setting']['bonus'] = 0;
        $arr['setting']['premium'] = 0;
        $arr['setting']['overtime'] = 0;
        $arr['setting']['other_amount'] = 0;
        $arr['setting']['deductions'] = 0;
        $arr['setting']['currency'] = 'USD';
        $arr['setting']['is_active'] = 1;
    }

    array_walk_recursive($arr, "convert_before_json");
    echo json_encode($arr);
    CloseDB($conn);
}

function saveSetting($mi){
    $conn = ConnectDB();
    $arr = [];
    $arr['answer'] = 'error';
    $setting = $mi['setting'];

    if($_SESSION['usr_role'] == 'admin'){
        $company_guid = $mi['company_guid'];
    } else {
        $company_guid = $_SESSION['usr_company_guid'];
    }

    $guid = $mi['guid'] ?? '';

    $command = [];
    $command[] = "`company_guid` = '".$company_guid."'";
    $command[] = "`vessel_type` = '".$mi['vessel_type']."'";
    $command[] = "`rank_id` = '".$mi['rank_id']."'";
    $command[] = "`required_on_board` = '".$mi['required_on_board']."'";
    $command[] = "`contract_months` = '".$mi['contract_months']."'";
    $command[] = "`base_salary` = '".$mi['base_salary']."'";
    $command[] = "`working_days` = '".$mi['working_days']."'";
    $command[] = "`daily_rate` = '".$mi['daily_rate']."'";
    $command[] = "`leave_pay` = '".$mi['leave_pay']."'";
    $command[] = "`employer_cost` = '".$mi['employer_cost']."'";
    $command[] = "`bonus` = '".$mi['bonus']."'";
    $command[] = "`premium` = '".$mi['premium']."'";
    $command[] = "`overtime` = '".$mi['overtime']."'";
    $command[] = "`other_amount` = '".$mi['other_amount']."'";
    $command[] = "`currency` = '".$mi['currency']."'";
    $command[] = "`is_active` = '".$mi['is_active']."'";

    if(isset($mi['deductions'])){
        $command[] = "`deductions` = '".$mi['deductions']."'";
    }

    if($guid == ''){
        $qGuid = mysqli_query($conn, "SELECT UUID() as guid");
        $guid = mysqli_fetch_assoc($qGuid)['guid'];

        $q = mysqli_query($conn, "INSERT INTO `budget_rank_salary` SET `guid` = '".$guid."', ".implode(", ", $command)."");
    } else {
        if($_SESSION['usr_role'] == 'admin'){
            $q = mysqli_query($conn, "UPDATE `budget_rank_salary` SET ".implode(", ", $command)." WHERE `guid` = '".$guid."'");
        } else {
            $q = mysqli_query($conn, "UPDATE `budget_rank_salary` SET ".implode(", ", $command)." WHERE `guid` = '".$guid."' AND `company_guid` = '".$company_guid."'");
        }
    }

    if($q){
        $arr['answer'] = 'ok';
        $arr['guid'] = $guid;
    } else {
        $arr['error'] = mysqli_error($conn);
    }

    array_walk_recursive($arr, "convert_before_json");
    echo json_encode($arr);
    CloseDB($conn);
}


function loadExchangeRate($mi){
    $arr = [];
    $arr['answer'] = 'error';
    $arr['rate'] = 1;
    $arr['rate_date'] = date('Y-m-d');

    $base_currency = strtoupper($mi['base_currency']);
    $quote_currency = strtoupper($mi['quote_currency']);

    $url = 'https://api.frankfurter.dev/v2/rates?base='.$base_currency.'&quotes='.$quote_currency;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);

    if($response != ''){
        $data = json_decode($response, true);

        if(isset($data[0]['rate'])){
            $arr['answer'] = 'ok';
            $arr['rate'] = $data[0]['rate'];

            if(isset($data[0]['date'])){
                $arr['rate_date'] = $data[0]['date'];
            }
        }
    }

    array_walk_recursive($arr, "convert_before_json");
    echo json_encode($arr);
}