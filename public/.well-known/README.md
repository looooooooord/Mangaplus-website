# Android App Links verification

This folder is served at `/.well-known/` so the site can host
`/.well-known/assetlinks.json` for Android App Links.

The file is intentionally **not** included yet, because it must contain the real
Android package name and the SHA-256 signing-certificate fingerprints of the
published MangaPlus app. Inventing those values would break verification and
could be misleading.

When the values are confirmed, add `assetlinks.json` here with this shape:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "THE_OFFICIAL_PACKAGE_NAME",
      "sha256_cert_fingerprints": ["THE_OFFICIAL_SHA256_FINGERPRINT"]
    }
  }
]
```

Site routes prepared for App Links:

- `/auth-action`
- `/manga/:id`
- `/novel/:id`
- `/reader/manga/:id/:chapterId`
- `/reader/novel/:id/:chapterId`

App Links are only active after the domain is connected, the file is deployed,
and the app declares the matching host and fingerprint.
