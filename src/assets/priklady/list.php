 <?php
    $dir = realpath(dirname(__FILE__));
    $files = scandir($dir);
    $files = array_diff($files, array('.', '..'));
    $json=json_encode($files,JSON_FORCE_OBJECT);
    return $json;
  ?>