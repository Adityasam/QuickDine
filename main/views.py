from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Create your views here.

def index(request):
    return redirect("http://localhost:3000")

@csrf_exempt
def testApi(request):
    data = [
        {"id": 1, "name": "Aditya"}
    ]
    return JsonResponse(data, safe=False)