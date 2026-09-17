# TASK: Replace Local Storage with Cloud Storage for AEON API Production

## Context

I have an AEON system deployed on Vercel.

Project structure:

apps/
 ├── admin
 ├── customer
 └── api

Backend:

apps/api

Current issue:

The API currently uses LocalStorage to save uploaded bills/files.

File:

apps/api/src/services/storage.service.js

Current code:

```javascript
constructor() {
  this.uploadDir = path.resolve(config.storage.localPath, 'bills');

  if (!fs.existsSync(this.uploadDir)) {
    fs.mkdirSync(this.uploadDir, { recursive: true });
  }
}