 <?php
    $dir = realpath(dirname(__FILE__));
    $files = scandir($dir);
    $files = array_diff($files, array('.', '..', 'list.php'));
    
    echo '[';
    $lastFile = array_pop($files);
    foreach ($files as &$file) {
	    echo '"'. $file .'", ';
	  }
    echo '"'. $lastFile .'"]';
	
	  unset($value);

  ?>