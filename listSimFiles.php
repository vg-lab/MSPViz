<?php
$simFolderPath = './simulations/';
$simFolderContent = scandir($simFolderPath);
$simFoldersToCheck = [];
$stdFiles = ["_SimulationFiles.json.scf"
        , "LocalNeuronCommonInfo.json"
        , "LocalNeuronInfo_0.json"
        , "GlobalSimulationParamsV2.json"
        , "GlobalParams_0.json"
        , "Connectivity_0.json"];

foreach ($simFolderContent as $elem) {
  if ($elem != '..' && $elem != '.' && is_dir($simFolderPath . $elem)) {
    array_push($simFoldersToCheck, $elem);
  }
}

$validSimFolders = [];
foreach ($simFoldersToCheck as $folder) {
	$folderContent = scandir($simFolderPath . $folder);
	$isVaildContet = true;
	foreach ($stdFiles as $file) {
		if (!in_array($file, $folderContent)) {
			$isVaildContet = false;
    			break;
		}
	}
	if($isVaildContet) {
		array_push($validSimFolders, $folder);
	}
}
echo json_encode($validSimFolders);
?>
