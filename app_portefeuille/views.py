from django.shortcuts import render
from .models import Portefeuille

def index(request):
    pf, _ = Portefeuille.objects.get_or_create(nom="Démo")
    return render(request, "app_portefeuille/index.html", {"portefeuille": pf})

def simulation(request):
    return render(request, "app_portefeuille/simulation.html")
