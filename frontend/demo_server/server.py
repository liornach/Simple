from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)

class DoughRequestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Respond to CORS preflight request."""
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        logging.info(f"📬 Received POST request: {self.path}")

        if self.path == "/api/submit-dough":
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            try:
                data = json.loads(post_data)
                logging.info("✅ Parsed JSON payload")
                logging.info("Flours: %s", data.get("flours", {}))
                logging.info("Ingredients: %s", data.get("ingredients", {}))

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")  # <- key line
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success"}).encode("utf-8"))

            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(b"Invalid JSON")
        else:
            self.send_response(404)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b"Not found")

    def do_GET(self):
        self.send_response(200)
        #is that really needed? It's already in the do_OPTIONS method 
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(b"Server is running.")

def run(server_class=HTTPServer, handler_class=DoughRequestHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    logging.info(f"🚀 Server started at http://localhost:{port}")
    httpd.serve_forever()

if __name__ == "__main__":
    run()
