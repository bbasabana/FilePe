#!/usr/bin/env python3
"""
Backend matériel Live20R pour l'agent FilePe (pyzkfp / ZKFinger SDK).

Prérequis Windows :
  1. Installer ZKFinger SDK : https://www.zkteco.com/en/Biometrics_Module_SDK
  2. pip install pyzkfp pillow
  3. Brancher le Live20R en USB
  4. FILEPE_FP_MODE=hardware npm start  (depuis fingerprint-agent/)

Usage (appelé par server.js) :
  python hardware.py status
  python hardware.py capture
  python hardware.py merge   # stdin JSON { "templates": ["b64", ...] }
"""

from __future__ import annotations

import base64
import io
import json
import sys


def ok(**kwargs):
    print(json.dumps({"ok": True, **kwargs}))
    sys.exit(0)


def fail(msg: str):
    print(json.dumps({"ok": False, "connected": False, "error": msg}))
    sys.exit(1)


def get_zk():
    try:
        from pyzkfp import ZKFP2
    except ImportError:
        fail("pyzkfp non installé. Exécutez: pip install pyzkfp pillow")
    zk = ZKFP2()
    zk.Init()
    count = zk.GetDeviceCount()
    if count < 1:
        fail("Aucun lecteur Live20R détecté. Vérifiez le câble USB et les drivers ZKFinger.")
    zk.OpenDevice(0)
    return zk


def cmd_status():
    try:
        zk = get_zk()
        zk.CloseDevice()
        zk.Terminate()
        print(json.dumps({"ok": True, "connected": True, "device": "Live20R"}))
    except SystemExit:
        raise
    except Exception as e:
        fail(str(e))


def cmd_capture():
    try:
        zk = get_zk()
        # Boucle courte : l'agent Node gère le timeout côté WebSocket
        import time

        deadline = time.time() + 18
        capture = None
        while time.time() < deadline:
            capture = zk.AcquireFingerprint()
            if capture:
                break
            time.sleep(0.05)

        if not capture:
            zk.CloseDevice()
            zk.Terminate()
            fail("Aucune empreinte capturée. Reposez le doigt à plat sur le lecteur.")

        tmp, img = capture
        # img : bytes bitmap brut ou déjà traitable
        image_b64 = None
        try:
            from PIL import Image

            # pyzkfp show_image attend le buffer ; on tente une image L depuis buffer
            if isinstance(img, (bytes, bytearray)):
                # Dimensions typiques Live20R ~ 256x288 ; fallback via show path
                w, h = 256, 288
                if len(img) == w * h:
                    im = Image.frombytes("L", (w, h), bytes(img))
                else:
                    im = Image.frombytes("L", (int(len(img) ** 0.5), int(len(img) ** 0.5)), bytes(img))
                buf = io.BytesIO()
                im.save(buf, format="PNG")
                image_b64 = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")
        except Exception:
            image_b64 = "data:image/png;base64," + base64.b64encode(bytes(img) if img else b"").decode(
                "ascii"
            )

        template_b64 = base64.b64encode(bytes(tmp)).decode("ascii")
        zk.CloseDevice()
        zk.Terminate()
        ok(imageBase64=image_b64, templateBase64=template_b64)
    except SystemExit:
        raise
    except Exception as e:
        fail(str(e))


def cmd_merge():
    try:
        raw = sys.stdin.read()
        data = json.loads(raw or "{}")
        templates = data.get("templates") or []
        if len(templates) < 1:
            fail("templates manquants")

        zk = get_zk()
        decoded = [base64.b64decode(t) for t in templates]
        # DBMerge attend 3 templates typiquement
        while len(decoded) < 3:
            decoded.append(decoded[-1])
        reg_temp = zk.DBMerge(decoded[0], decoded[1], decoded[2])
        if not reg_temp:
            # Fallback : dernier template
            merged = decoded[-1]
        else:
            merged = bytes(reg_temp)
        zk.CloseDevice()
        zk.Terminate()
        ok(templateBase64=base64.b64encode(merged).decode("ascii"))
    except SystemExit:
        raise
    except Exception as e:
        fail(str(e))


def main():
    if len(sys.argv) < 2:
        fail("usage: hardware.py status|capture|merge")
    cmd = sys.argv[1]
    if cmd == "status":
        cmd_status()
    elif cmd == "capture":
        cmd_capture()
    elif cmd == "merge":
        cmd_merge()
    else:
        fail(f"commande inconnue: {cmd}")


if __name__ == "__main__":
    main()
