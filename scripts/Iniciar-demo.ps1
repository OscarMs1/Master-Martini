param([ValidateSet('frontend','backend')] [string]$Servicio='frontend')
& (Join-Path $PSScriptRoot 'Windows.ps1') -Accion $Servicio
