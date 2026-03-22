        class Character {
            constructor(x, y, id = 0) {
                this.id = id; this.name = "Personaje "+(id+1); // Para darles distinto aspecto
                this.x = x;
                this.y = y;
                this.targetX = x;
                this.targetY = y;
                this.path = []; // Nueva propiedad para la ruta
                this.action = ACTIONS.IDLE;
                this.facing = 'down';
                this.frame = 0;
                this.speed = 0.85; // pixel por frame - ligeramente más lento
                this.actionTimer = 0;
                this.nextActionTime = 200;
                this.sitting = false;
                this.isWaiting = false; // Flag para instrucciones de Gemini
                this.targetTileX = null;
                this.targetTileY = null;
                this.lastX = x;
                this.lastY = y;
                this.stuckTimer = 0;
                
                // Aspecto aleatorio basado en el ID
                this.outfitIndex = this.id % 6 + 1; // Outfit1 a Outfit6
                this.hairIndex = this.id % 8; // 0 a 7
            }

            update() {
                this.frame++;
                this.actionTimer++;

