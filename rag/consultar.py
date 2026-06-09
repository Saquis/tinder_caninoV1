#!/usr/bin/env python3
"""
consultar.py v2 — Busca en base vectorial + auto-reindex si hay cambios

Modos:
  python consultar.py "pregunta" [top_k]
  python consultar.py "pregunta" [top_k] --auto     # reindexa silenciosamente si hay cambios
  python consultar.py --reindex                       # fuerza reindex
  python consultar.py --status                        # muestra estado del RAG
"""

import sys
import json
from pathlib import Path

RAG_DIR = Path(__file__).parent
CHROMA_DIR = RAG_DIR / "chroma_db"
STATE_FILE = RAG_DIR / ".rag_state.json"


def necesita_reindex():
    """Verifica si algún archivo cambió desde el último índice."""
    from indexar import estado_actual, estado_guardado, cambios_detectados
    actual = estado_actual()
    guardado = estado_guardado()
    if guardado is None:
        return True
    cambia, _, _, _ = cambios_detectados(actual, guardado)
    return cambia


def reindexar(silent=False):
    """Ejecuta indexar.py."""
    from indexar import main as indexar_main
    if silent:
        # Correr sin prints de progreso por archivo
        import io
        from contextlib import redirect_stdout
        f = io.StringIO()
        with redirect_stdout(f):
            indexar_main()
        if "--force" in sys.argv:
            sys.argv.remove("--force")
    else:
        indexar_main()


def buscar(query, n=5):
    from chromadb import PersistentClient
    from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

    client = PersistentClient(path=str(CHROMA_DIR))
    try:
        coleccion = client.get_collection(
            name="tindercanino",
            embedding_function=DefaultEmbeddingFunction(),
        )
    except ValueError:
        return []

    resultados = coleccion.query(
        query_texts=[query],
        n_results=n,
    )

    return resultados


def mostrar_resultados(query, resultados, formato="humano"):
    """Muestra resultados en el formato indicado."""
    if not resultados or not resultados["documents"] or not resultados["documents"][0]:
        if formato == "compacto":
            print("SIN_RESULTADOS")
        else:
            print("❌ Sin resultados.")
        return

    docs = resultados["documents"][0]
    metas = resultados["metadatas"][0]
    dists = resultados["distances"][0]

    if formato == "compacto":
        # Formato para que Saquis (asistente) parseé fácil
        print(f"RAG:{len(docs)}")
        for doc, meta, dist in zip(docs, metas, dists):
            archivo = meta.get("archivo", "?")
            linea_ini = meta.get("linea_ini", "?")
            linea_fin = meta.get("linea_fin", "?")
            score = round(1 - dist, 4)
            print(f"---R:{score} {archivo}:{linea_ini}-{linea_fin}---")
            print(doc)
            print("---R_END---")
        return

    # Formato humano (default)
    print("=" * 60)
    print(f"🔍 Query: {query}")
    print(f"📄 Top {len(docs)} resultados:\n")
    print("=" * 60)

    for i, (doc, meta, dist) in enumerate(zip(docs, metas, dists)):
        archivo = meta.get("archivo", "?")
        linea_ini = meta.get("linea_ini", "?")
        linea_fin = meta.get("linea_fin", "?")
        score = round(1 - dist, 4)

        print(f"\n--- Resultado {i+1} (score: {score}) ---")
        print(f"📁 {archivo}:{linea_ini}-{linea_fin}")
        print("-" * 40)
        print(doc[:1500])
        if len(doc) > 1500:
            print("... (truncado)")
        print()


def main():
    # Flags
    auto = "--auto" in sys.argv
    compacto = "--compacto" in sys.argv

    # --status: mostrar estado
    if "--status" in sys.argv:
        if STATE_FILE.exists():
            estado = json.loads(STATE_FILE.read_text())
            cambia = necesita_reindex()
            print("🧠 RAG TinderCanino — Estado")
            print(f"   Archivos indexados: {len(estado)}")
            print(f"   ChromaDB: {'✅ existe' if CHROMA_DIR.exists() else '❌ no existe'}")
            print(f"   Cambios pendientes: {'🔄 sí' if cambia else '✅ no'}")
            print(f"   Chunk size: 1200 chars, overlap: 200 chars")
            print(f"   Embeddings: all-MiniLM-L6-v2 (local, ONNX)")
        else:
            print("❌ RAG no indexado aún. Ejecutá: python indexar.py")
        return

    # --reindex: forzar reindex
    if "--reindex" in sys.argv:
        print("🔨 Reindexando...")
        reindexar(silent=auto)
        return

    # Consulta normal
    if len(sys.argv) < 2 or sys.argv[1].startswith("--"):
        print("Uso: python consultar.py \"pregunta\" [top_k] [--auto] [--compacto]")
        print("     python consultar.py --status")
        print("     python consultar.py --reindex")
        sys.exit(1)

    query = sys.argv[1]
    k = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2].isdigit() else 5

    # Auto-reindex si hay cambios
    if auto and necesita_reindex():
        print("🔄 Cambios detectados, reindexando...")
        reindexar(silent=True)
        print("   ✅ Reindexado.\n")

    resultados = buscar(query, n=k)
    mostrar_resultados(query, resultados, formato="compacto" if compacto else "humano")


if __name__ == "__main__":
    main()
