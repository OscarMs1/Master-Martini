param([ValidateSet('comprobar','instalar','frontend','backend','validar')] [string]$Accion='comprobar')
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
Set-Location $root
if ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME 'bin/java.exe'))) {
 $env:PATH=(Join-Path $env:JAVA_HOME 'bin')+';'+$env:PATH
}
function Require($name,$help) { if (!(Get-Command $name -ErrorAction SilentlyContinue)) { throw "Falta $name. $help" } }
function Run($command,$arguments) { & $command @arguments; if ($LASTEXITCODE -ne 0) { throw "Fallo al ejecutar $command (codigo $LASTEXITCODE)." } }
Require node 'Instala Node.js 22.12+ o 24 LTS.'
Require npm 'Instala Node.js con npm.'
Require java 'Instala JDK 17 o superior y configura JAVA_HOME.'
$nodeVersion=(& node -p "process.versions.node").Split('.')
if ([int]$nodeVersion[0] -lt 22 -or ([int]$nodeVersion[0] -eq 22 -and [int]$nodeVersion[1] -lt 12)) { throw 'Se requiere Node.js 22.12+ o 24.' }
$javaText=(& java --version | Out-String)
if ($LASTEXITCODE -ne 0 -or $javaText -notmatch '(?:openjdk|java) (\d+)' -or [int]$Matches[1] -lt 17) { throw 'Se requiere JDK 17 o superior.' }
$wrapper=Join-Path $root 'backend/mvnw.cmd'
if (!(Test-Path $wrapper)) { throw 'Falta backend/mvnw.cmd. Restaura Maven Wrapper.' }
Write-Host 'Node, npm y Java disponibles. Maven se descarga mediante Wrapper si es necesario.'
if ($Accion -in @('comprobar','backend')) {
 $dbPort=if($env:DB_PORT){[int]$env:DB_PORT}else{3306}
 $dbHost=if($env:DB_HOST){$env:DB_HOST}else{'127.0.0.1'}
 $tcp=New-Object Net.Sockets.TcpClient
 try { $tcp.Connect($dbHost,$dbPort) } catch { throw "MySQL no responde en ${dbHost}:$dbPort. Inicia el servicio o configura DB_HOST/DB_PORT." } finally { $tcp.Dispose() }
}
switch($Accion) {
 'instalar' { Run npm @('--prefix','frontend','ci'); Run $wrapper @('-f','backend/pom.xml','test') }
 'validar' { Run npm @('--prefix','frontend','run','test:coverage'); Run npm @('--prefix','frontend','run','build'); Run $wrapper @('-f','backend/pom.xml','test','jacoco:report') }
 'frontend' {
  if(Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue){throw 'El puerto 5173 ya esta ocupado.'}
  Run npm @('--prefix','frontend','run','dev','--','--strictPort')
 }
 'backend' {
  if(Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue){throw 'El puerto 8080 ya esta ocupado.'}
  if(!$env:DB_PASSWORD){throw 'Configura DB_PASSWORD en esta terminal; no guardes contrasenas en el repositorio.'}
  $env:UPLOAD_DIRECTORY=Join-Path $root '.local/uploads'
  Run $wrapper @('-f','backend/pom.xml','spring-boot:run')
 }
}
