@echo off
chcp 65001 >nul

echo 正在复制 friendship-plugin 到思源笔记插件目录...

:: 检查源文件夹是否存在
if not exist "friendship-plugin" (
    echo 错误：找不到 friendship-plugin 文件夹！
    pause
    exit /b 1
)

:: 创建目标目录（如果不存在）
if not exist "D:\AppData\SiYuan\data\plugins" (
    mkdir "D:\AppData\SiYuan\data\plugins"
)

:: 复制并替换插件文件夹
xcopy "friendship-plugin" "D:\AppData\SiYuan\data\plugins\" /s /y /i

if %errorlevel% equ 0 (
    echo 复制完成！friendship-plugin 已成功部署到思源笔记。
) else (
    echo 复制过程中出现错误，错误代码：%errorlevel%
)

pause