# 证书名称
$subject = "CN=ManagePC Dev"

# PFX 密码
$password = ConvertTo-SecureString "123456" -AsPlainText -Force

# 输出目录
$output = "$PSScriptRoot\cert"

New-Item -ItemType Directory -Force -Path $output | Out-Null

Write-Host "Creating Code Signing Certificate..."

$cert = New-SelfSignedCertificate `
    -Type CodeSigningCert `
    -Subject $subject `
    -KeyExportPolicy Exportable `
    -KeySpec Signature `
    -CertStoreLocation "Cert:\CurrentUser\My"

Write-Host "Exporting PFX..."

Export-PfxCertificate `
    -Cert $cert `
    -FilePath "$output\ManagePC.pfx" `
    -Password $password | Out-Null

Write-Host "Exporting CER..."

Export-Certificate `
    -Cert $cert `
    -FilePath "$output\ManagePC.cer" | Out-Null

Write-Host ""
Write-Host "Done!"
Write-Host "PFX : $output\ManagePC.pfx"
Write-Host "CER : $output\ManagePC.cer"
Write-Host "Password : 123456"