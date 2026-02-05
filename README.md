# POSIDRE

**Portail des Outils de Suivi des Indicateurs et Déterminants de la Réussite Éducative**

Système de questionnaires éducatifs permettant aux enseignants de créer et distribuer des questionnaires TEDP 2.0 pour évaluer les déterminants de la réussite scolaire.

[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## Fonctionnalités

### Pour les Enseignants
- Création automatique de questionnaires TEDP 2.0 (20 questions)
- Génération de codes PIN uniques
- Consultation des réponses en temps réel
- Gestion complète des questionnaires
- Tableau de bord avec statistiques

### Pour les Étudiants
- Accès anonyme via code PIN
- Interface responsive
- Types de questions variés (texte, échelles, choix multiples/simples)
- Thème clair/sombre

## Installation

### Prérequis
- .NET 10 SDK
- Node.js 18+
- -React 19

### Démarrage

```bash
# Backend
cd LearningProject.Server
dotnet restore
dotnet ef database update
dotnet run

# Frontend (nouveau terminal)
cd learningproject.client
npm install
npm run dev
```

Accès:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5053

## Tests

```bash
# Backend
cd LearningProject.Server
dotnet test

# Frontend
cd learningproject.client
npm test
```

## Stack Technique

**Frontend**
- React 19 + Vite 6
- Tailwind CSS v4
- Shadcn/ui (Radix UI)
- Vitest + React Testing Library

**Backend**
- ASP.NET Core 10
- Entity Framework Core 8
- SQLite
- JWT Authentication
- xUnit

## Structure

```
Posidre/
├── LearningProject.Server/     # Backend ASP.NET Core
│   ├── Controllers/
│   ├── Models/
│   └── Tests/
├── learningproject.client/     # Frontend React
│   ├── src/
│   └── __tests__/
```

## Copyright

© 2026 Tous droits réservés.
