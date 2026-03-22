# hailo-vision — Safe Change Boundaries

## SAFE (do freely)
- Read source code
- Run tests locally
- View detection results

## CAUTION (test first, verify after)
- Modify the inference pipeline
- Change model parameters
- Edit video processing logic

## DANGEROUS (ask before doing)
- Deploy to production Pis
- Change Hailo model files
- Modify camera configuration

## NEVER
- Run inference loops without rate limiting (overheats hardware)
- Delete model files
- Force push to main
