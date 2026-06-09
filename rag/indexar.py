#!/usr/bin/env python3
"""
indexar.py — Escanea el proyecto TinderCanino, chunk + embed + ChromaDB

Cambios v2 (03-Jun):
  - chunk_size: 800 → 1200 (mejor para código JS)
  - overlap: 100 → 200 (más contexto entre chunks)
  - Guarda estado de archivos (.rag_state.json) para detectar cambios
  - --force: reindexa aunque no haya cambios
"""

import os
import sys
import json
import hashlib
from pathlib import Path

PROYECTO = Path("/mnt/c/Users/RYZEN 5 GAMER/tinder_CaninoV1")
CHROMA_DIR = Path(__file__).parent / "chroma_db"
STATE_FILE = Path(__file__).parent / ".rag_state.json"
EXTENSIONES = {".js", ".md", ".txt", ".json"}
EXCLUIR_DIRS = {"node_modules", ".git", "venv", "rag", "chroma_db", "__pycache__",
                ".expo", "android", "ios", "assets", ".vscode"}
EXCLUIR_ARCHIVOS = {"ESTRUCTURA_COMPLETA.txt", "package-lock.json", "yarn.lock"}
MAX_TAMANO = 100 * 1024  # 100KB máx por archivo

CHUNK_SIZE = 1200   # chars por chunk (antes 800)
OVERLAP = 200       # chars de solapamiento (antes 100)


# --- Chunking ---

def chunk_text(text, filename, chunk_size=CHUNK_SIZE, overlap=OVERLAP):
    """Divide texto en chunks con solapamiento."""
    lines = text.split("\n")
    chunks = []
    current = []
    current_len = 0

    for i, line in enumerate(lines):
        line_len = len(line) + 1  # +1 por el newline
        if current_len + line_len > chunk_size and current:
            chunk_txt = "\n".join(current)
            chunk_id = hashlib.md5(f"{filename}:{i}:{chunk_txt[:50]}".encode()).hexdigest()[:12]
            chunks.append({
                "id": chunk_id,
                "text": chunk_txt,
                "metadata": {
                    "archivo": filename,
                    "linea_ini": max(0, i - len(current)),
                    "linea_fin": i,
                    "tamano": len(chunk_txt),
                }
            })
            # Overlap
            overlap_lines = []
            overlap_len = 0
            for l in reversed(current):
                l_len = len(l) + 1
                if overlap_len + l_len > overlap:
                    break
                overlap_lines.insert(0, l)
                overlap_len += l_len
            current = overlap_lines
            current_len = overlap_len
        current.append(line)
        current_len += line_len

    if current:
        chunk_txt = "\n".join(current)
        chunk_id = hashlib.md5(f"{filename}:end:{chunk_txt[:50]}".encode()).hexdigest()[:12]
        chunks.append({
            "id": chunk_id,
            "text": chunk_txt,
            "metadata": {
                "archivo": filename,
                "linea_ini": max(0, len(lines) - len(current)),
                "linea_fin": len(lines),
                "tamano": len(chunk_txt),
            }
        })
    return chunks


# --- Recolector ---

def recolectar_archivos():
    """Recolecta archivos a indexar."""
    archivos = []
    for root, dirs, files in os.walk(str(PROYECTO)):
        dirs[:] = [d for d in dirs if d not in EXCLUIR_DIRS]
        for f in files:
            if f in EXCLUIR_ARCHIVOS:
                continue
            ext = Path(f).suffix.lower()
            if ext not in EXTENSIONES:
                continue
            ruta = Path(root) / f
            if ruta.stat().st_size > MAX_TAMANO:
                continue
            rel = ruta.relative_to(PROYECTO)
            archivos.append((str(rel), ruta))
    return sorted(archivos)


# --- Estado de archivos (para detección de cambios) ---

def escanear_estado(archivos):
    """Devuelve dict con mtime + size de cada archivo."""
    estado = {}
    for rel_path, abs_path in archivos:
        st = abs_path.stat()
        estado[rel_path] = {
            "mtime": st.st_mtime_ns,
            "size": st.st_size,
        }
    return estado


def estado_actual():
    """Escanea estado actual del proyecto."""
    return escanear_estado(recolectar_archivos())


def estado_guardado():
    """Lee estado guardado del archivo .rag_state.json."""
    if not STATE_FILE.exists():
        return None
    try:
        return json.loads(STATE_FILE.read_text())
    except:
        return None


def guardar_estado(estado):
    """Guarda estado en .rag_state.json."""
    STATE_FILE.write_text(json.dumps(estado, indent=2))
    print(f"  📝 Estado guardado en {STATE_FILE.name}")


def cambios_detectados(actual, guardado):
    """Compara estados. Devuelve listas de (agregados, modificados, eliminados)."""
    if guardado is None:
        return True, list(actual.keys()), [], []
    actual_set = set(actual.keys())
    guardado_set = set(guardado.keys())

    agregados = sorted(actual_set - guardado_set)
    eliminados = sorted(guardado_set - actual_set)
    modificados = []
    for f in actual_set & guardado_set:
        if actual[f] != guardado[f]:
            modificados.append(f)

    cambios = bool(agregados or modificados or eliminados)
    return cambios, agregados, modificados, eliminados


# --- Main ---

def main():
    force = "--force" in sys.argv

    print("=" * 60)
    print("📦 Indexador RAG v2 — TinderCanino")
    print(f"   Chunk size: {CHUNK_SIZE} chars, overlap: {OVERLAP} chars")
    print("=" * 60)

    archivos = recolectar_archivos()
    estado_act = estado_actual()
    estado_grd = estado_guardado()
    cambia, agregados, modificados, eliminados = cambios_detectados(estado_act, estado_grd)

    if not cambia and not force:
        print("\n✅ Sin cambios desde último índice. Usá --force para reindexar igual.")
        print(f"   Archivos: {len(archivos)}, último índice tenía {len(estado_grd or {})} archivos.")
        return

    if estado_grd is None:
        print("\n🆕 Primera indexación o estado perdido.")
    elif force:
        print("\n🔨 Reindexación forzada.")
    else:
        print(f"\n🔄 Cambios detectados:")
        if agregados:
            print(f"   ➕ {len(agregados)} archivos nuevos:")
            for f in agregados[:5]:
                print(f"      {f}")
            if len(agregados) > 5:
                print(f"      ... y {len(agregados)-5} más")
        if modificados:
            print(f"   ✏️  {len(modificados)} archivos modificados:")
            for f in modificados[:5]:
                print(f"      {f}")
            if len(modificados) > 5:
                print(f"      ... y {len(modificados)-5} más")
        if eliminados:
            print(f"   🗑️  {len(eliminados)} archivos eliminados")

    print(f"\n📁 Archivos a indexar: {len(archivos)}")

    # Recolectar chunks
    todos_chunks = []
    for rel_path, abs_path in archivos:
        try:
            text = abs_path.read_text(encoding="utf-8", errors="replace")
            chunks = chunk_text(text, rel_path)
            todos_chunks.extend(chunks)
            print(f"  ✅ {rel_path} → {len(chunks)} chunks")
        except Exception as e:
            print(f"  ❌ {rel_path}: {e}")

    print(f"\n📊 Total chunks: {len(todos_chunks)}")

    # Indexar en ChromaDB
    from chromadb import PersistentClient
    from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

    print(f"\n💾 Conectando a ChromaDB en: {CHROMA_DIR}")
    client = PersistentClient(path=str(CHROMA_DIR))

    try:
        client.delete_collection("tindercanino")
    except:
        pass

    coleccion = client.get_or_create_collection(
        name="tindercanino",
        embedding_function=DefaultEmbeddingFunction(),
    )

    batch_size = 100
    for i in range(0, len(todos_chunks), batch_size):
        batch = todos_chunks[i:i+batch_size]
        coleccion.add(
            ids=[c["id"] for c in batch],
            documents=[c["text"] for c in batch],
            metadatas=[c["metadata"] for c in batch],
        )
        sys.stdout.write(f"\r⏳ Indexando... {min(i+batch_size, len(todos_chunks))}/{len(todos_chunks)}")
        sys.stdout.flush()

    print(f"\n\n✅ Indexación completa: {len(todos_chunks)} chunks")
    print(f"   📍 {CHROMA_DIR}")

    # Guardar estado para detección futura
    guardar_estado(estado_act)

    # Limpiar flag --force
    if "--force" in sys.argv:
        sys.argv.remove("--force")


if __name__ == "__main__":
    main()
