        let default_COLLISION_MAP = [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,1],[1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1],[1,0,0,0,0,0,1,0,3,1,1,3,0,1,0,0,0,0,0,1],[1,0,0,0,0,0,1,0,3,1,1,3,0,1,0,0,0,0,0,1],[1,0,0,0,0,0,1,0,3,1,1,3,0,1,0,0,0,0,0,1],[1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,1,1,1,1,1,0,0,0,3,1,1,3,0,1],[1,0,0,3,0,0,3,0,0,3,0,0,1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,1,0,3,1,1,3,0,1],[1,0,0,0,1,1,1,1,0,0,1,0,1,0,0,0,0,0,0,1],[1,0,0,3,0,0,3,0,0,3,0,0,1,0,1,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,2,1,1,1],[1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,2,1,1,1],[1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],[1,0,0,0,1,1,1,1,0,0,0,0,1,0,1,1,1,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,3,0,0,0,1],[1,0,1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]];
        let COLLISION_MAP = default_COLLISION_MAP;
        try {
            const savedMap = localStorage.getItem('pixel_office_collision');
            if (savedMap) COLLISION_MAP = JSON.parse(savedMap);
        } catch(e) {}

        // Estado de las puertas: { "x,y": true/false (true = abierta) }
        let DOORS_OPEN = {};

        // Clase Buscador de rutas (A*)
        class Pathfinder {
            static findPath(startX, startY, endX, endY) {
                if (endX < 0 || endX >= COLS || endY < 0 || endY >= ROWS) return [];
                if (COLLISION_MAP[endY][endX] === 1) return []; // Obstáculo
                
                const startNode = {x: startX, y: startY, g: 0, h: 0, f: 0, parent: null};
                const endNode = {x: endX, y: endY};
                
                const openList = [startNode];
                const closedList = new Set();
                
                while (openList.length > 0) {
                    openList.sort((a, b) => a.f - b.f);
                    const current = openList.shift();
                    
                    const pKey = `${current.x},${current.y}`;
                    closedList.add(pKey);
                    
                    if (current.x === endNode.x && current.y === endNode.y) {
                        let curr = current;
                        const path = [];
