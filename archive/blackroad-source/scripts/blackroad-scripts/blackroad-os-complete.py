#!/usr/bin/env python3
"""
BlackRoad OS - Complete Integration Example

Wires together all layers:
- Input Router (keys → events)
- Command Executor (events → state)
- Renderer (state → ANSI)
- Engine (state model)

This is the full system running.
"""

import time
import sys

# Import all layers
try:
    # Attempt clean imports
    import blackroad_engine as engine
    import blackroad_renderer as renderer
    import blackroad_input_router as input_router
    import blackroad_command_executor as executor
    print("✓ All modules imported successfully")
except ImportError as e:
    print(f"✗ Import error: {e}")
    print("\nMake sure all files exist:")
    print("  - blackroad-engine.py")
    print("  - blackroad-renderer.py")
    print("  - blackroad-input-router.py")
    print("  - blackroad-command-executor.py")
    sys.exit(1)

def main():
    """Main integration loop"""
    print("BlackRoad OS - Complete System")
    print("=" * 60)
    print()
    
    # Initialize all components
    print("Initializing components...")
    router = input_router.create_input_router()
    state = engine.create_initial_state()
    print("✓ System initialized")
    print()
    print("Controls:")
    print("  1-7: Switch modes")
    print("  /: Command mode")
    print("  j/k: Scroll")
    print("  q: Quit")
    print()
    print("Starting in 2 seconds...")
    time.sleep(2)
    
    # Main event loop
    frame_count = 0
    last_render = time.time()
    last_agent_update = time.time()
    
    try:
        while state.get('running', True):
            frame_count += 1
            current_time = time.time()
            
            # 1. Poll input (non-blocking)
            event = input_router.poll_input(router)
            
            if event:
                # Convert Event object to dict if needed
                if hasattr(event, 'to_dict'):
                    event_dict = event.to_dict()
                else:
                    event_dict = event
                
                # 2. Execute event → state mutation
                state = executor.handle_event(event_dict, state)
            
            # 3. Update agent lifecycle (every 0.5s)
            if current_time - last_agent_update > 0.5:
                state = executor.update_agent_lifecycle(state)
                last_agent_update = current_time
            
            # 4. Update live metrics (every 1s)
            if current_time - last_render > 1.0:
                state = engine.update_live_metrics(state)
                last_render = current_time
            
            # 5. Render if dirty (throttled to 30 FPS)
            if state.get('dirty', False):
                # Get terminal size
                try:
                    import os
                    rows, cols = os.popen('stty size', 'r').read().split()
                    width = int(cols)
                    height = int(rows)
                except:
                    width = 120
                    height = 40
                
                # Render
                output = renderer.render(state, width, height)
                print(output)
                
                state['dirty'] = False
            
            # Small delay to prevent CPU spin
            time.sleep(0.01)
    
    except KeyboardInterrupt:
        print("\n\nShutdown requested...")
    
    finally:
        # Cleanup
        router.cleanup()
        print("System stopped")
        print(f"Total frames: {frame_count}")

if __name__ == "__main__":
    main()
