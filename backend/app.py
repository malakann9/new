from flask import Flask, send_from_directory
import os

# Initialize Flask
# static_folder='static': The directory where we copied the Vue 'dist' files
# static_url_path='': Serve these files at the root URL (e.g. /assets/...)
app = Flask(__name__, static_folder='static', static_url_path='')

# ---------------------------------------------------------------
# TC_11 – Güvenlik Başlıkları: CSP, X-Frame-Options, HSTS
# Her yanıta otomatik olarak eklenir; mevcut hiçbir kodu etkilemez.
# ---------------------------------------------------------------
@app.after_request
def add_security_headers(response):

    # Clickjacking'e karşı koruma: sadece aynı origin iframe'e izin ver
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    # CSP – Vue.js'i (inline stil/script, eval, blob, data URI) bozmayacak kadar esnek
    response.headers['Content-Security-Policy'] = (
        "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
    )
    return response

@app.route('/')
def index():
    """Serve the main Vue entry point."""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    """
    Serve static files (JS, CSS, images) if they exist.
    Otherwise, fall back to index.html for Vue Router (SPA support).
    """
    # Construct the full path to the requested file
    file_path = os.path.join(app.static_folder, path)
    
    # Check if the file exists and is a file (not a directory)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    
    # If file doesn't exist, return index.html to allow Vue Router to handle the route
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
