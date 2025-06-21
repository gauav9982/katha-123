# Katha Sales System

આ એક complete sales management system છે જે React frontend અને Node.js backend સાથે બનેલું છે.

## 📁 Project Structure

```
katha-123/
├── frontend/          # React application
│   ├── src/          # Source code
│   ├── public/       # Static files
│   ├── package.json  # Frontend dependencies
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
├── backend/          # Node.js API server
│   ├── config/       # Configuration files
│   ├── routes/       # API routes
│   ├── migrations/   # Database migrations
│   ├── package.json  # Backend dependencies
│   └── setup-database.cjs
├── database/         # Database files
│   ├── katha_sales.db
│   └── kathasales_live_backup.db
├── config/           # Server configuration
│   ├── nginx.conf
│   ├── nginx-katha.conf
│   ├── ecosystem.config.cjs
│   └── deploy keys
├── docs/             # Documentation
│   ├── README.md
│   ├── DATABASE_SETUP.md
│   ├── deployment-checklist.md
│   └── FINAL_WORKFLOW.md
└── package.json      # Root project file
```