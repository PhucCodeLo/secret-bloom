#!/usr/bin/env python3
"""Deploy secret-bloom dist/ to Vercel via the MCP server.

Uploads each file with upload_file, then creates a production deployment
referencing the uploaded files by sha1. Idempotent-ish: re-running uploads
the same files again (Vercel dedupes by sha) and creates a new deployment.
"""
import base64
import hashlib
import json
import os
import subprocess
import sys

VERCEL = "/opt/hatch/bin/vercel"
DIST = os.path.expanduser("~/workspace/secret-bloom/dist")


def call_tool(name, args):
    cmd = [VERCEL, "call-tool", "--name", name, "--arguments-json", json.dumps(args)]
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    out = (p.stdout or "") + (p.stderr or "")
    if p.returncode != 0:
        print(f"!! {name} failed (rc={p.returncode})")
        print(out[:2000])
        sys.exit(1)
    return out


def main():
    files = []
    for root, _dirs, names in os.walk(DIST):
        for n in sorted(names):
            full = os.path.join(root, n)
            rel = os.path.relpath(full, DIST)
            with open(full, "rb") as f:
                data = f.read()
            sha1 = hashlib.sha1(data).hexdigest()
            b64 = base64.b64encode(data).decode()
            print(f"upload {rel} ({len(data)} bytes, sha1 {sha1[:10]}...)")
            call_tool("upload_file", {
                "requestBody": b64,
                "xVercelDigest": sha1,
                "contentLength": len(data),
            })
            files.append({"file": rel, "sha": sha1, "size": len(data)})

    print(f"creating deployment with {len(files)} files...")
    body = {
        "name": "secret-bloom",
        "target": "production",
        "files": files,
        "projectSettings": {"framework": None},
    }
    out = call_tool("create_deployment", {"requestBody": body, "forceNew": "1"})
    print(out[:3000])


if __name__ == "__main__":
    main()
