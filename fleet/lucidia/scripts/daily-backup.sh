#!/bin/bash
# Daily automated backup
curl -s http://localhost:5900/api/backup/create > /dev/null
curl -s http://localhost:5900/api/backup/cleanup > /dev/null
