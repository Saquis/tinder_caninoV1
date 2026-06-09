# 🧠 RAG TinderCanino — v2 (03-Jun-2026)

## Stack

| Componente | v1 (31-May) | v2 (03-Jun) |
|---|---|---|
| Chunk size | 800 chars | **1200 chars** (mejor para código) |
| Overlap | 100 chars | **200 chars** |
| Auto-reindex | ❌ | **✅** (detección por mtime/size) |
| Embeddings | all-MiniLM-L6-v2 | igual (local, ONNX) |
| Vector store | ChromaDB | igual |
| Shell wrapper | ❌ | **✅** `rag.sh` |

## Archivos

```
rag/
├── chroma_db/          # Base vectorial persistente
├── venv/               # Virtualenv
├── indexar.py          # Indexador v2
├── consultar.py        # Consulta v2 (con auto-reindex)
├── rag.sh              # Wrapper shell
├── .rag_state.json     # Estado de archivos (para detección de cambios)
└── RAG_SETUP.md        # Este archivo
```

## Cómo usar

### Consulta rápida (auto-reindex si hay cambios):
```bash
cd /mnt/c/Users/RYZEN 5 GAMER/tinder_CaninoV1/rag
./rag.sh "cómo funciona el swipe"
./rag.sh "error al crear perro" 3
```

### Forzar reindex:
```bash
./rag.sh --reindex
```

### Ver estado:
```bash
./rag.sh --status
```

### Formato compacto (para Saquis asistente):
```bash
./rag.sh --compacto "endpoints del backend"
```

## Integración con Saquis (asistente)

Cuando necesites contexto del proyecto, usá:
```bash
cd /mnt/c/Users/RYZEN 5 GAMER/tinder_CaninoV1/rag && python consultar.py "tu pregunta" 5 --auto --compacto
```

El flag `--auto` reindexa automáticamente si detecta cambios en el código.
El flag `--compacto` imprime en formato parseable:
```
RAG:3
---R:0.92 backend/src/...js:45-67---
[contenido del chunk]
---R_END---
---R:0.88 mobile/src/...js:12-30---
[contenido del chunk]
---R_END---
```

## Lo que aprendí en v2

1. Chunk size de 1200 captura mejor funciones/métodos JS completos (antes 800 cortaba en medio)
2. Overlap de 200 asegura que contexto entre chunks no se pierda
3. Detección de cambios por mtime+size evita reindex innecesarios
4. `.rag_state.json` es barato de mantener (~2KB para 91 archivos)
5. Wrapper `rag.sh` simplifica el uso diario
