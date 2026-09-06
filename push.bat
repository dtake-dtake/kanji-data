@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ═══════════════════════════════════
echo   漢字データ → GitHub 更新
echo ═══════════════════════════════════
echo.

:: 変更があるか確認
git status --short
echo.

:: 変更がなければ終了
git diff --quiet --exit-code && git diff --cached --quiet --exit-code && (
    echo 変更はありません。
    pause
    exit /b
)

:: コミットメッセージを入力
set /p MSG="コミットメッセージ（例: 漢字データ修正）: "
if "%MSG%"=="" set MSG=データ更新

:: add, commit, push
git add -A
git commit -m "%MSG%"
git push origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ GitHubへの反映が完了しました！
) else (
    echo ❌ エラーが発生しました。
)
echo.
pause
