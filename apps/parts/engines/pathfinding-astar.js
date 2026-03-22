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
                        while (curr.parent) {
                            path.push({x: curr.x, y: curr.y});
                            curr = curr.parent;
                        }
                        return path.reverse();
                    }
                    
                    const neighbors = [
                        {x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}
                    ];
                    
                    for (let n of neighbors) {
                        const nx = current.x + n.x;
                        const ny = current.y + n.y;
                        
                        if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue;
                        if (COLLISION_MAP[ny][nx] === 1) continue; 
                        
                        // No cruzar por encima de sillas, a menos que sea el destino exacto
                        if (COLLISION_MAP[ny][nx] === 3 && (nx !== endNode.x || ny !== endNode.y)) continue;
                        
                        const nKey = `${nx},${ny}`;
                        if (closedList.has(nKey)) continue;
                        
                        const cost = DOORS_OPEN[nKey] ? 1 : 10;
                        const g = current.g + cost;
                        const h = Math.abs(nx - endNode.x) + Math.abs(ny - endNode.y);
                        const f = g + h;
                        
                        const existingNode = openList.find(node => node.x === nx && node.y === ny);
