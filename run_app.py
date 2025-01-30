import subprocess
import sys
import os
import webbrowser
from time import sleep

def run_backend():
    print("Starting backend server...")
    os.chdir('backend')
    return subprocess.Popen([sys.executable, 'main.py'])

def run_frontend():
    print("Starting frontend server...")
    os.chdir('../frontend')
    if os.name == 'nt':  # Windows
        return subprocess.Popen(['npm.cmd', 'run', 'dev'])
    else:  # Unix/Linux/Mac
        return subprocess.Popen(['npm', 'run', 'dev'])

def main():
    # Start backend
    backend_process = run_backend()
    print("Backend server started!")
    
    # Start frontend
    frontend_process = run_frontend()
    print("Frontend server started!")
    
    # Wait a bit for servers to start
    sleep(5)
    
    # Open browser
    webbrowser.open('http://localhost:3000')
    
    try:
        # Keep the script running
        backend_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_process.terminate()
        frontend_process.terminate()
        print("Servers stopped!")

if __name__ == "__main__":
    main()
