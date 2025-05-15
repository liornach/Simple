import socket

def connect_to_google():
    server_endpoint = ('8.8.8.8', 80)
    serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    serversocket.connect(server_endpoint)
    serversocket.close()