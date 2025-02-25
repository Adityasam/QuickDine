class MyMiddleware:
  def __init__(self, get_response):
    self.get_response = get_response

  def process_request(self, request):
    print(f"Processing request: {request.method} {request.path}")