# GospelLift QA and Release Checklist

## Static Brain Activator
- [ ] GitHub Actions workflow succeeds and Pages URL loads over HTTPS.
- [ ] Test iPhone-width, Android-width and desktop layouts.
- [ ] Test every Brain Activator topic and idea-selection button.
- [ ] Generate brief with empty fields and with populated fields.
- [ ] Verify copy and download actions.
- [ ] Select an audio file and verify the page says it is not uploaded.
- [ ] Test reset, keyboard navigation, labels, contrast and visible focus.
- [ ] Verify privacy/terms draft links and all page assets.

## Full product release gates
- [ ] Authentication and password recovery tested.
- [ ] Upload size/type validation and failure recovery tested.
- [ ] Two-artist cross-account data and storage isolation test passes.
- [ ] Admin access is server-enforced and artist cannot edit internal notes.
- [ ] Rights consent, creative approval, expense approval and takedown process verified.
- [ ] Deletion, backups and restore process documented.
- [ ] No secrets committed; production env variables verified.
- [ ] Real artist pilot completed before describing the full system as production-ready.
