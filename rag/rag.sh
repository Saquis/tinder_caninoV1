#!/usr/bin/env bash
# rag.sh — Wrapper para el RAG de TinderCanino
# Uso: ./rag.sh "pregunta"      → consulta (auto-reindex si cambios)
#      ./rag.sh "pregunta" 10   → top 10 resultados
#      ./rag.sh --reindex       → fuerza reindex
#      ./rag.sh --status        → estado del RAG
#      ./rag.sh --compacto "pregunta" → formato compacto (para Saquis)

set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
PYTHON="$DIR/venv/bin/python"

case "$1" in
  --reindex)
    "$PYTHON" "$DIR/indexar.py" --force
    ;;
  --status)
    "$PYTHON" "$DIR/consultar.py" --status
    ;;
  --compacto)
    shift
    "$PYTHON" "$DIR/consultar.py" "$@" --auto --compacto
    ;;
  *)
    "$PYTHON" "$DIR/consultar.py" "$@" --auto
    ;;
esac
