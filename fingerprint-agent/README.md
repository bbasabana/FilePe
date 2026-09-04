# Agent local FilePe — ZKTeco Live20R

Le navigateur (même sur Vercel) **ne peut pas** parler au câble USB.
Sur **chaque PC** où on branche le Live20R, on installe cet agent + les drivers ZKTeco.
FilePe en ligne ↔ navigateur ↔ **agent local** ↔ Live20R USB.

**OS supportés par ZKTeco pour le Live20R : Windows, Linux, Android — pas macOS.**

## Installation poste d’enrôlement (Windows)

### A. Une seule fois par machine

1. Télécharger et installer **ZKFinger SDK for Windows**  
   https://www.zkteco.com/en/Biometrics_Module_SDK  
   (ça installe le **driver USB** du Live20R)
2. Installer **Node.js** LTS : https://nodejs.org  
3. Installer **Python 3** : https://www.python.org  
4. Dans un terminal :

```bat
pip install pyzkfp pillow
cd chemin\vers\FilePe\fingerprint-agent
npm install
```

### B. À chaque session d’enrôlement

1. Brancher le **Live20R** en USB
2. Lancer l’agent :

```bat
cd chemin\vers\FilePe\fingerprint-agent
set FILEPE_FP_MODE=hardware
npm start
```

Laisser cette fenêtre ouverte. Message attendu : `mode=hardware` et lecteur détecté.

3. Ouvrir FilePe (**lien Vercel** ou localhost) dans **Chrome** ou **Edge**
4. Fiche prévenu / détenu → Empreintes → Capturer (vrai doigt sur le lecteur)

## Vercel

Rien à installer sur Vercel pour le fingerprint.  
L’app cloud envoie/reçoit les empreintes ; le lecteur reste sur le PC local via l’agent.

## macOS

ZKTeco ne fournit **pas** de SDK/driver Live20R pour Mac.  
Brancher le lecteur sur un MacBook **ne permet pas** la capture réelle.  
Pour tester le vrai matériel : PC **Windows** (ou Linux avec SDK Linux).
