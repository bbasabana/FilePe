# Agent local FilePe — ZKTeco Live20R

Le site https://file-pe.vercel.app/ ne parle **pas** au USB.
Sur le PC où le Live20R est branché, on lance cet **agent** (pont local).

## Pour l’opérateur Windows (objectif simple)

1. Installer **ZKFinger SDK** (driver) — une fois  
   https://www.zkteco.com/en/Biometrics_Module_SDK
2. Télécharger le dossier Agent (Release / artifact CI)  
3. Double-clic **`Demarrer-Agent.bat`**
4. Chrome → https://file-pe.vercel.app/ → empreintes

Voir [INSTALL-WINDOWS.md](./INSTALL-WINDOWS.md).

**Pas besoin** de développer sur Windows. Le Mac suffit pour le code FilePe.

## Dev / test sans exe

```bat
npm install
set FILEPE_FP_MODE=hardware
npm start
```

Build exe (sur Windows ou via GitHub Actions) :

```bat
npm run build:exe
```
