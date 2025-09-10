@echo off
echo Uploading images to Firebase Storage...

REM Upload all images from public folder to Firebase Storage
for %%f in (public\*.jpg) do (
    echo Uploading %%f...
    firebase storage:upload "%%f" "assets/images/%%~nxf"
)

for %%f in (public\*.png) do (
    echo Uploading %%f...
    firebase storage:upload "%%f" "assets/images/%%~nxf"
)

for %%f in (public\*.gif) do (
    echo Uploading %%f...
    firebase storage:upload "%%f" "assets/images/%%~nxf"
)

echo Upload complete!
pause

