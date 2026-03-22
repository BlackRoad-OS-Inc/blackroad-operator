#!/bin/bash
# Log all SSH sessions
while true; do
  date >> /var/log/trap.log
  who >> /var/log/trap.log
  ss -tp >> /var/log/trap.log
  sleep 60
done
