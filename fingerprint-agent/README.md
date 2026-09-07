# Agent local FilePe — ZKTeco Live20R

## Pour les postes (SIMPLE)

Sur chaque PC Windows :

1. Installer **ZKFinger SDK** (driver) — une fois  
2. Dézipper **FilePe-Fingerprint-Agent-Windows.zip**  
3. Double-clic **`Demarrer-Agent.bat`**  
4. Chrome → https://file-pe.vercel.app/

Détails : [INSTALL-WINDOWS.md](./INSTALL-WINDOWS.md) · [LIRE-MOI.txt](./LIRE-MOI.txt)

**Pas** de Git / Node / pip sur les postes opérateurs.

## Dev (Mac / source)

```bash
npm install
FILEPE_FP_MODE=mock npm start
```

Build pack Windows : GitHub Actions → artifact `FilePe-Fingerprint-Agent-Windows`.
