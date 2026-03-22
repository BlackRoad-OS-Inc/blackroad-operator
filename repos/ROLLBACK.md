<!-- FILE: ROLLBACK.md -->

To revert this cleanup:

# Rollback Guide

1. Move any directories from `_trash/` back to their original locations, e.g.:
   ```
   git mv _trash/logs ./
   git mv _trash/var/www/blackroad/logs var/www/blackroad/
   ```
2. Revert the commit:
   ```
   git revert HEAD
   ```
To revert this cleanup:

To revert this cleanup:

1. Restore files from `/_trash` to their original locations as needed.
2. `git revert HEAD` to undo the commit.
