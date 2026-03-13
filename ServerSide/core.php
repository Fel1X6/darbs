<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


function ConnectDB(){
  $conn = new mysqli(db_ip, db_usr, db_pwd, db_schema, db_port);

  if ($conn->connect_error) {
     return null;
  }
  mysqli_set_charset($conn,'utf8');

  return $conn;
}

function uuidv4() {
    return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        // 32 bits for "time_low"
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),

        // 16 bits for "time_mid"
        mt_rand( 0, 0xffff ),

        // 16 bits for "time_hi_and_version",
        // four most significant bits holds version number 4
        mt_rand( 0, 0x0fff ) | 0x4000,

        // 16 bits, 8 bits for "clk_seq_hi_res",
        // 8 bits for "clk_seq_low",
        // two most significant bits holds zero and one for variant DCE1.1
        mt_rand( 0, 0x3fff ) | 0x8000,

        // 48 bits for "node"
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
    );
}


function cStrToBool($str){
    if($str == 'true') return true;
    else return false;
}


function escape_deep(&$item, $conn) {
  if (is_array($item)) {
      foreach ($item as &$sub) escape_deep($sub, $conn);
  } else {
      $item = mysqli_real_escape_string($conn, $item);
  }
}

function generateUUID($conn=null){
    if($conn==null)
      $subconn=ConnectDB();
    else $subconn=$conn;

    $query=mysqli_query($subconn,"SELECT uuid() as guid ");


    if($conn==null)
      CloseDB($subconn);
    
    return mysqli_fetch_assoc($query)['guid'];

}

function CloseDB($conn){
    mysqli_close($conn);
}

function DefaultConnect($ip,$usr,$pwd,$schema){
    $conn = new mysqli($ip, $usr, $pwd, $schema);

    if ($conn->connect_error) {
        return null;
    }
    mysqli_set_charset($conn,'utf8');

    return $conn;
}

function convert_before_json(&$item, $key)
{
    if($item==null) $item='';
}

 ?>
