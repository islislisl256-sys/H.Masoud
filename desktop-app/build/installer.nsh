!macro customInstall
!macroend

Function .onInstSuccess
  ; This script deletes the installer file after the installation succeeds
  ExecShell "open" "cmd.exe" "/C ping 127.0.0.1 -n 3 > Nul & Del /f /q $\"$EXEPATH$\"" SW_HIDE
FunctionEnd