#$PCs = "CAORIPRODT349","CAORIPRODT350","CAWHATRUTALKINABOUTWILLIS"
$PCs = Get-Content 'C:\scripts\PCs.txt'
# MONTHLY TEST PATCHES
$KBs = Get-Content 'C:\scripts\CurrentMonthWU.txt'
$pingStatusArray = New-Object -TypeName PSObject #Object array for onlien status
$KBCount = 0 # !0 if has updates from $KBs
$WinUpdates = @() #Object array of updates installed
$JSONFile = @() # Full ending object array
$WUStatus = $false # default WUStatus
$checkUpdateList = @()

# Rename the last output with yesterday's date 
$theDate = (get-date).AddDays(-1).ToString("MM.dd.yyyy")
Rename-Item "C:\Temp\PingStatus.json" -NewName "C:\Temp\PingStatus $theDate.json"

Foreach($PC in $PCs) {
    
    $pingStatusArray = New-Object -TypeName PSObject
    $WindowsUpdateList = New-Object -TypeName PSObject

    #get the online status
    if (Test-Connection -ComputerName $PC -Quiet) {
        write-host $PC : -ForegroundColor Green "TEST SUCCESSFUL"
        $PingStatus = $true
        
        #check windows update status and get list of updates installed
            Foreach ($u in $KBs){
                $checkUpdate = Get-HotFix -Id $u -EA SilentlyContinue -ComputerName $PC
                if ($u -eq $checkUpdate.HotFixID){
                    $checkUpdateList += $checkUpdate.HotFixID
                    $KBCount += 1
                }
            }

        #check virus def date
        $Reg = [Microsoft.Win32.RegistryKey]::OpenRemoteBaseKey('LocalMachine', $PC)
        $RegKey= $Reg.OpenSubKey("SOFTWARE\\Symantec\\Symantec Endpoint Protection\\CurrentVersion\\public-opstate")
        $VirusDefDate = $RegKey.GetValue("LatestVirusDefsDate")

        #if PC has updates, add those to an object array
        if ($KBCount -gt 0){
            $WUStatus = $true
            #check windows update status for array
            Add-Member -InputObject $WindowsUpdateList -MemberType NoteProperty -Name WinUpdateStatus -Value $WUStatus
            Add-Member -InputObject $WindowsUpdateList -MemberType NoteProperty -Name TotalUpdateCount -Value $checkUpdateList.Length
            Add-Member -InputObject $WindowsUpdateList -MemberType NoteProperty -Name WinUpdate -Value $checkUpdateList
        } else {
            $WUStatus = $false
            Add-Member -InputObject $WindowsUpdateList -MemberType NoteProperty -Name WinUpdateStatus -Value $WUStatus            
        }
        $KBCount = 0
    } else {
        write-host -ForegroundColor Red $PC : "FAILED"
        $PingStatus = $false
    }

    #Get the short name of the PC
    $shortName = $PC.Substring($PC.length - 4)
    # Build Final Objet Array
    Add-Member -InputObject $pingStatusArray -MemberType NoteProperty -Name PCShortName -Value $shortName
    Add-Member -InputObject $pingStatusArray -MemberType NoteProperty -Name PCName -Value $PC
    Add-Member -InputObject $pingStatusArray -MemberType NoteProperty -Name OnlineStatus -Value $PingStatus
    Add-Member -InputObject $pingStatusArray -MemberType NoteProperty -Name WUStatus -Value $WindowsUpdateList
    Add-Member -InputObject $pingStatusArray -MemberType NoteProperty -Name VirusDefDate -Value $VirusDefDate

    $VirusDefDate = ""

    $JSONFile += $pingStatusArray
}


$JSONFile | ConvertTo-Json | Out-File C:\Temp\PingStatus.json
$JSONText = $JSONFile | ConvertTo-Json
$testFile = "var pingStatus = " + $JSONText.ToString() + ";"
$testFile | Out-File C:\Temp\PingStatus.js