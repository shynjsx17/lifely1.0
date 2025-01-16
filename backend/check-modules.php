<?php
echo "<h1>Apache Modules</h1>";
echo "<pre>";
print_r(apache_get_modules());
echo "</pre>";

echo "<h1>PHP Info</h1>";
phpinfo();
?> 