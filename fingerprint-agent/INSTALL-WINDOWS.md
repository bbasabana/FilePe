# Installation poste d’enrôlement (SIMPLE)

Sur chaque PC Windows avec un Live20R, **seulement 2 choses** :

## 1. Une fois — driver ZKTeco

Installer **ZKFinger SDK for Windows** (fourni avec le lecteur / site ZKTeco).  
Ça installe le driver USB du Live20R.

## 2. Une fois — pack Agent FilePe

1. Télécharger **FilePe-Fingerprint-Agent-Windows.zip**  
   (GitHub → Releases, ou artifact Actions)
2. Dézipper où vous voulez (ex. `C:\FilePe-Agent\`)
3. Double-clic sur **`Demarrer-Agent.bat`**
4. Chrome sur **ce même PC** → https://file-pe.vercel.app/

Pas de Git. Pas de Node. Pas de `pip`. Pas de clone.

## À chaque session

1. Brancher le Live20R  
2. Double-clic `Demarrer-Agent.bat` (fenêtre ouverte)  
3. Ouvrir FilePe en ligne  

## Ce qu’il y a dans le ZIP

| Fichier | Rôle |
|---------|------|
| `Demarrer-Agent.bat` | Lancement (double-clic) |
| `FilePeFingerprintAgent.exe` | Pont navigateur ↔ lecteur |
| `hardware.py` | Capture via SDK ZKTeco |
| `python\` | Python embarqué + pyzkfp |

## Dépannage

- Bannière « hors ligne » dans FilePe → l’agent n’est pas lancé sur **ce** PC  
- Lecteur non détecté → rebrancher USB, vérifier le SDK ZKFinger  
- Autre PC / Mac → le lecteur doit être sur la machine où Chrome est ouvert  
