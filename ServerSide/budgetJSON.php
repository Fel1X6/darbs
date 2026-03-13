<?php
//if(!isset($_SESSION['usr'])){ echo "Session ended!"; exit;}

include('cnf.php');
include('core.php');

$conn = ConnectDB();
escape_deep($_POST, $conn);
CloseDB($conn);

if(isset($_POST['fName'])){

    if($_POST['fName'] === 'loadVessels') loadVessels($_POST['mi'] ?? []);
    if($_POST['fName'] === 'loadRanks') loadRanks($_POST['mi'] ?? []);
    if($_POST['fName'] === 'loadRankData') loadRankData($_POST['mi'] ?? []);
 //   if($_POST['fName'] === 'saveBudget') saveBudget($_POST['mi'] ?? []);
 //   if($_POST['fName'] === 'loadSavedBudget') loadSavedBudget($_POST['mi'] ?? []);

}


function loadVessels(){
    $conn = ConnectDB();
    $arr = [];
    $arr['answer'] = 'error';
    $arr['vessels'] = [];

    $q = mysqli_query($conn,"SELECT *FROM `budget_vessel`WHERE `is_active` = 1 ORDER BY `vessel_name`");
    if($q){
        $arr['answer'] = 'ok';
        while($row = mysqli_fetch_assoc($q)){
            $arr['vessels'][] = $row;
        }
    }

    array_walk_recursive($arr, "convert_before_json");
    echo json_encode($arr);
    CloseDB($conn);
}


function loadRanks($mi){
    $conn = ConnectDB();
    $arr = [];
    $arr['answer'] = 'error';
    $arr['ranks'] = [];

    $vessel_guid = trim($mi['vessel_guid'] ?? '');
    if($vessel_guid != ''){
        $q = mysqli_query($conn," SELECT * FROM `budget_rank` WHERE `vessel_guid` = '".$vessel_guid."' AND `is_active` = 1 ORDER BY `rank_name`");        
        if($q){
            $arr['answer'] = 'ok';
            while($row = mysqli_fetch_assoc($q)){
                $arr['ranks'][] = $row;
            }
        }
    }

    array_walk_recursive($arr, "convert_before_json");
    echo json_encode($arr);
    CloseDB($conn);
}


function loadRankData($mi){
    $conn = ConnectDB();
    $arr = [];
    $arr['answer'] = 'error';
    $arr['rank'] = [];

    $guid = trim($mi['guid'] ?? '');
    if($guid != ''){
        $q = mysqli_query($conn,"SELECT * FROM `budget_rank` WHERE `guid` = '".$guid."'");
        if($q && mysqli_num_rows($q) > 0){
            $arr['answer'] = 'ok';
            $arr['rank'] = mysqli_fetch_assoc($q);
        }
    }

    array_walk_recursive($arr, "convert_before_json");
    echo json_encode($arr);
    CloseDB($conn);
}


/*
  Это уже таблица сохранённых расчётов.
  Если ты её ещё не создал — эту функцию пока не вызывай.

function saveBudget($mi){
    $conn = ConnectDB();
    $arr = [];
    $arr['answer'] = 'error';

    $guid = trim($mi['guid'] ?? '');
    if($guid == ''){
        $guid = generateUUID($conn);
    }

    $m = [];
    $m[] = "`vessel_guid` = 
    $m[] = "`rank_guid` = 
    $m[] = "`required_on_board` = 
    $m[] = "`already_on_board` = 
    $m[] = "`contract_months` = 
    $m[] = "`base_salary` = 
    $m[] = "`working_days` = 
    $m[] = "`daily_rate` = 
    $m[] = "`leave_pay` = 
    $m[] = "`employer_cost` = 
    $m[] = "`bonus` = 
    $m[] = "`premium` = 
    $m[] = "`overtime` = 
    $m[] = "`other_additions` = 
    $m[] = "`deductions` = 
    $m[] = "`currency` = 
    $m[] = "`monthly_total` = 
    $m[] = "`contract_total` 
    $m[] = "`crew_total` = 

    $q = mysqli_query($conn,"SELECT `guid` FROM `budget_saved` WHERE `guid` = '".$guid."'");
    if($q){
        $q = mysqli_query($conn,"UPDATE `budget_saved` SET ".implode(', ', $m)." WHERE `guid` = '".$guid."'");
    } else {
        $q = mysqli_query($conn," INSERT INTO `budget_saved` SET `guid` = '".$guid."', ".implode(', ', $m)."");}

    if($q){
        $arr['answer'] = 'ok';
        $arr['guid'] = $guid;
    }

    array_walk_recursive($arr, "convert_before_json");
    echo json_encode($arr);
    CloseDB($conn);
}
*/
/*
function loadSavedBudget($mi){
    $conn = ConnectDB();
    $arr = [];
    $arr['answer'] = 'error';
    $arr['budget'] = [];

    $guid = trim($mi['guid'] ?? '');
    if($guid == '')

    $q = mysqli_query($conn,"SELECT *FROM `budget_saved` WHERE `guid` = '".$guid."'");

    if($q){
        $arr['answer'] = 'ok';
        $arr['budget'] = mysqli_fetch_assoc($q);
    }
    }

    array_walk_recursive($arr, "convert_before_json");
    echo json_encode($arr);
    CloseDB($conn);
}
*/