# git_setup_push.ps1
# PowerShell script to init, commit and push a local project to GitHub
# Usage: run in PowerShell. The script is interactive.

function ExitWith($msg) {
    Write-Host $msg -ForegroundColor Yellow
    exit 1
}

# 1) check git exists
try {
    $gitVersion = & git --version 2>$null
} catch {
    ExitWith "Git tidak ditemukan. Silakan install Git dari https://git-scm.com/download/win lalu jalankan ulang skrip ini."
}
if (-not $gitVersion) {
    ExitWith "Git tidak ditemukan. Silakan install Git dari https://git-scm.com/download/win lalu jalankan ulang skrip ini."
}
Write-Host "Terdeteksi: $gitVersion" -ForegroundColor Green

# 2) ask for project folder
$defaultPath = (Get-Location).Path
$projectPath = Read-Host "Masukkan path project (enter = $defaultPath)"
if ([string]::IsNullOrWhiteSpace($projectPath)) { $projectPath = $defaultPath }

if (-not (Test-Path $projectPath)) {
    ExitWith "Path '$projectPath' tidak ditemukan. Pastikan path benar lalu coba lagi."
}

Set-Location $projectPath
Write-Host "Bekerja di: $(Get-Location)" -ForegroundColor Cyan

# 3) git init if needed
if (-not (Test-Path .git)) {
    Write-Host "Menginisialisasi repository git..." -ForegroundColor Cyan
    & git init
} else {
    Write-Host "Repository git sudah ada di folder ini." -ForegroundColor Cyan
}

# 4) optional .gitignore ask
if (-not (Test-Path .gitignore)) {
    $addGitignore = Read-Host "Tidak ada .gitignore. Mau tambahkan file .gitignore standar Node? (y/n)"
    if ($addGitignore -match '^[Yy]') {
        @(
            "node_modules/",
            "dist/",
            "frontend/node_modules/",
            ".env",
            ".DS_Store"
        ) | Out-File -FilePath .gitignore -Encoding utf8
        Write-Host ".gitignore dibuat." -ForegroundColor Green
    }
}

# 5) stage all and commit
Write-Host "Menambahkan semua file ke staging..." -ForegroundColor Cyan
& git add .

$defaultMsg = "Initial commit - $(Get-Date -Format yyyy-MM-dd_HH:mm)"
$commitMsg = Read-Host "Masukkan pesan commit (enter = '$defaultMsg')"
if ([string]::IsNullOrWhiteSpace($commitMsg)) { $commitMsg = $defaultMsg }

# commit (handle case no changes)
$hasChanges = (& git status --porcelain)
if (-not [string]::IsNullOrWhiteSpace($hasChanges)) {
    & git commit -m $commitMsg
    Write-Host "Commit dibuat: $commitMsg" -ForegroundColor Green
} else {
    Write-Host "Tidak ada perubahan untuk di-commit." -ForegroundColor Yellow
}

# 6) setup remote
$remoteUrl = Read-Host "Masukkan URL repo GitHub (HTTPS) (contoh: https://github.com/username/repo.git). Jika kosong, skip push step"
if (-not [string]::IsNullOrWhiteSpace($remoteUrl)) {
    # check if remote origin exists
    $remoteExists = (& git remote) -contains "origin"
    if ($remoteExists) {
        Write-Host "Remote 'origin' sudah ada. Mengganti URL remote menjadi: $remoteUrl" -ForegroundColor Cyan
        & git remote set-url origin $remoteUrl
    } else {
        Write-Host "Menambahkan remote origin: $remoteUrl" -ForegroundColor Cyan
        & git remote add origin $remoteUrl
    }

    # Force create main branch locally if needed, then push
    # Create main branch and switch
    try {
        & git branch -M main
    } catch {
        # ignore if fails
    }

    Write-Host "Melakukan push ke origin main..." -ForegroundColor Cyan
    try {
        & git push -u origin main
        Write-Host "Push sukses! Repo tersedia di $remoteUrl" -ForegroundColor Green
    } catch {
        Write-Host ""
        Write-Host "Push gagal. Kemungkinan penyebab:" -ForegroundColor Yellow
        Write-Host " - Autentikasi: Anda perlu memasukkan GitHub username dan Personal Access Token (PAT) saat diminta."
        Write-Host " - Jika diminta credential, masukkan username GitHub Anda sebagai username, dan PAT sebagai password."
        Write-Host " - Atau konfigurasi Git Credential Manager agar tidak diminta terus-menerus."
        Write-Host ""
        Write-Host "Petunjuk singkat untuk membuat PAT:" -ForegroundColor Cyan
        Write-Host "1) Buka https://github.com/settings/tokens (Personal access tokens) -> Generate new token." 
        Write-Host "2) Pilih scope 'repo' (minimal) dan buat token."
        Write-Host "3) Salin token (hanya ditampilkan sekali) dan gunakan sebagai password ketika git meminta password."
        Write-Host ""
        Write-Host "Setelah mengatasi autentikasi, jalankan lagi perintah:\n    git push -u origin main" -ForegroundColor Green
    }
} else {
    Write-Host "Anda memilih tidak meng-upload sekarang. Selesai." -ForegroundColor Yellow
}

Write-Host "Selesai." -ForegroundColor Green
