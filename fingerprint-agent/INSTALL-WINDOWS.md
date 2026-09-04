# Installation poste Windows (opérateur)

Tu développes sur Mac. Sur le PC Windows d’enrôlement, **pas besoin** de Node, Git, ni de cloner le projet pour coder.

## Ce que l’opérateur installe (objectif)

1. **ZKFinger SDK Windows** (driver Live20R) — une fois  
   https://www.zkteco.com/en/Biometrics_Module_SDK
2. **Dossier Agent FilePe** (zip / Release GitHub) — double-clic `Demarrer-Agent.bat`
3. **Chrome** → https://file-pe.vercel.app/

Pas de développement sur ce PC.

## En attendant le .exe tout-en-un

Tant que la Release `FilePeFingerprintAgent.exe` n’est pas publiée, setup **minimal** développeur sur ce Windows :

```bat
git clone https://github.com/bbasabana/FilePe.git
cd FilePe\fingerprint-agent
npm install
pip install pyzkfp pillow
Demarrer-Agent.bat
```

Puis Chrome → https://file-pe.vercel.app/

## Pourquoi pas seulement Vercel ?

Le site en ligne ne voit pas le câble USB.  
L’agent (bat / exe) sur **ce** PC fait le pont : Live20R → navigateur → Vercel.
