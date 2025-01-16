<?php
$modules = apache_get_modules();
echo "<pre>";
print_r($modules);
echo "</pre>";

echo "<h2>Server Software:</h2>";
echo $_SERVER['SERVER_SOFTWARE'];

echo "<h2>Headers that will be sent:</h2>";
$headers = headers_list();
print_r($headers);
?> 