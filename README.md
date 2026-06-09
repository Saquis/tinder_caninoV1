# 🐾 TinderCanino

> La primera app de citas caninas del Ecuador

**TinderCanino** conecta dueños de perros para que sus mascotas puedan conocerse. Swipe, match y chat — todo pensado para perros y sus humanos.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| **Mobile** | React Native + Expo SDK 54 |
| **Backend** | Node.js + Express (Arquitectura Hexagonal) |
| **Base de datos** | PostgreSQL via Supabase |
| **Auth** | JWT + Refresh Tokens |
| **Storage** | Supabase Storage (fotos) |
| **AI/RAG** | ChromaDB + all-MiniLM-L6-v2 |

## Features

- ✅ Swipe de perfiles con like / nope / super like
- ✅ Match automático en like mutuo
- ✅ Chat entre matches
- ✅ Geolocalización — perros cercanos
- ✅ Subida de fotos a Supabase Storage
- ✅ Dark mode
- ✅ Reportes y bloqueos
- ✅ Panel de administración

## Arquitectura

Backend implementado con **Arquitectura Hexagonal (Ports & Adapters)** separando dominio de infraestructura en 3 capas:

```
domain/        → Entidades, puertos, casos de uso (JS puro)
infrastructure → Implementaciones concretas (Supabase, JWT)
entry-points/  → API REST (Express routes + controllers)
```

## Setup rápido

```bash
# Backend
cd backend
cp .env.example .env   # Configurar credenciales
npm install
npm run dev

# Frontend
cd mobile
npm install
npx expo start
```

## Estado del proyecto

MVP funcional. En desarrollo activo.

---

*Construido con ❤️ para los perros del Ecuador*
