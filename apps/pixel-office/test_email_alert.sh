#!/bin/bash

# Script de prueba para simular alertas de email
# Uso: ./test_email_alert.sh [numero_de_emails]

COUNT=${1:-1}
echo "nuevos: $COUNT" > /tmp/email_alert_pending.txt
echo "[$(date +"%H:%M")] Alerta creada: $COUNT email(s) pendientes"
