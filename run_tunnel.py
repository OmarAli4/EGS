from pyngrok import ngrok
import time

try:
    public_url = ngrok.connect(8000)
    print(f"==================================================")
    print(f"PUBLIC SHAREABLE URL: {public_url}")
    print(f"==================================================")
    while True:
        time.sleep(10)
except Exception as e:
    print(f"Tunnel Error: {e}")
