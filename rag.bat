@echo off
setlocal enabledelayedexpansion

if "%~1"=="" (
    echo Uso: rag "tu pregunta aqui"
    echo.
    echo Ejemplos:
    echo   rag como funciona el match
    echo   rag --compacto crea perro endpoint
    echo   rag --reindex
    echo   rag --status
    exit /b 1
)

set COMPACTO=0
set QUERY=
set FIRST=1

for %%i in (%*) do (
    if "%%i"=="--reindex" (
        wsl -e bash -lc "cd '/mnt/c/Users/RYZEN 5 GAMER/tinder_CaninoV1/rag' && ./rag.sh --reindex"
        exit /b !errorlevel!
    )
    if "%%i"=="--status" (
        wsl -e bash -lc "cd '/mnt/c/Users/RYZEN 5 GAMER/tinder_CaninoV1/rag' && ./rag.sh --status"
        exit /b !errorlevel!
    )
    if "%%i"=="--compacto" (
        set COMPACTO=1
    ) else (
        if !FIRST!==1 (
            set QUERY=%%i
            set FIRST=0
        ) else (
            set QUERY=!QUERY! %%i
        )
    )
)

if %COMPACTO%==1 (
    wsl -e bash -lc "cd '/mnt/c/Users/RYZEN 5 GAMER/tinder_CaninoV1/rag' && ./rag.sh --compacto '!QUERY!'"
) else (
    wsl -e bash -lc "cd '/mnt/c/Users/RYZEN 5 GAMER/tinder_CaninoV1/rag' && ./rag.sh '!QUERY!'"
)
