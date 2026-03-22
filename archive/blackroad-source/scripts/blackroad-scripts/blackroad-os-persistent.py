#!/usr/bin/env python3
"""
BlackRoad OS - Complete System with Persistence

Full integration including save/load state
"""

import time
import sys
import signal

def main():
    """Main with persistence"""
    # Import all layers
    try:
        from blackroad_engine import create_initial_state, update_live_metrics
        from blackroad_renderer import render
        from blackroad_input_router import create_input_router, poll_input
        from blackroad_command_executor import handle_event, update_agent_lifecycle
        from blackroad_persistence import load_state, save_state, ensure_persistence_dirs
        print("✓ All modules imported")
    except ImportError as e:
        print(f"✗ Import error: {e}")
        sys.exit(1)
    
    # Ensure persistence directories exist
    ensure_persistence_dirs()
    
    # Initialize
    print("BlackRoad OS")
    print("=" * 60)
    
    # Try to load previous state
    print("Loading state...")
    state = load_state()
    
    if state:
        print("✓ Restored previous session")
    else:
        print("✓ Starting fresh session")
        state = create_initial_state()
    
    # Initialize input router
    router = create_input_router()
    
    print()
    print("Controls:")
    print("  1-7: Switch modes")
    print("  /save: Save state")
    print("  /snapshot: Create snapshot")
    print("  /: Command mode")
    print("  q: Quit")
    print()
    print("Starting...")
    time.sleep(1)
    
    # Graceful shutdown handler
    def shutdown_handler(signum, frame):
        print("\n\nShutdown signal received...")
        state['running'] = False
    
    signal.signal(signal.SIGINT, shutdown_handler)
    signal.signal(signal.SIGTERM, shutdown_handler)
    
    # Main loop
    last_agent_update = time.time()
    last_metrics_update = time.time()
    
    try:
        while state.get('running', True):
            current_time = time.time()
            
            # Poll input
            event = poll_input(router)
            if event:
                event_dict = event.to_dict() if hasattr(event, 'to_dict') else event
                state = handle_event(event_dict, state)
            
            # Update agent lifecycle
            if current_time - last_agent_update > 0.5:
                state = update_agent_lifecycle(state)
                last_agent_update = current_time
            
            # Update metrics
            if current_time - last_metrics_update > 1.0:
                state = update_live_metrics(state)
                last_metrics_update = current_time
            
            # Render if dirty
            if state.get('dirty', False):
                try:
                    import os
                    rows, cols = os.popen('stty size', 'r').read().split()
                    width, height = int(cols), int(rows)
                except:
                    width, height = 120, 40
                
                output = render(state, width, height)
                print(output)
                state['dirty'] = False
            
            time.sleep(0.01)
    
    except KeyboardInterrupt:
        print("\n\nShutdown requested...")
    
    finally:
        # Save state on exit
        print("\nSaving state...")
        if save_state(state):
            print("✓ State saved")
        else:
            print("✗ Error saving state")
        
        # Cleanup
        router.cleanup()
        print("Goodbye")

if __name__ == "__main__":
    main()
