// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { statusCommand } from './status.js'
import { agentsCommand } from './agents.js'
import { deployCommand } from './deploy.js'
import { logsCommand } from './logs.js'
import { configCommand } from './config.js'
import { gatewayCommand } from './gateway.js'
import { invokeCommand } from './invoke.js'
import { initCommand } from './init.js'
import { roadbridgeCommand } from './roadbridge.js'
import { serveCommand } from './serve.js'
import { meshCommand } from './mesh.js'
import { indexCommand } from './index-cmd.js'
import { workersCommand } from './workers.js'
import { bottlenecksCommand } from './bottlenecks.js'

export const program = new Command()
  .name('br')
  .description('BlackRoad OS operator CLI')
  .version('0.2.0')

program.addCommand(statusCommand)
program.addCommand(agentsCommand)
program.addCommand(deployCommand)
program.addCommand(logsCommand)
program.addCommand(configCommand)
program.addCommand(gatewayCommand)
program.addCommand(invokeCommand)
program.addCommand(initCommand)
program.addCommand(roadbridgeCommand)
program.addCommand(serveCommand)
program.addCommand(meshCommand)
program.addCommand(indexCommand)
program.addCommand(workersCommand)
program.addCommand(bottlenecksCommand)
