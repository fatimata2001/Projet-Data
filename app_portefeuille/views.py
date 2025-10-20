from django.shortcuts import render
from .models import Portefeuille
# Create your views here.

def index(request):
    # Crée ou récupère un portefeuille "Démo"
    pf, _ = Portefeuille.objects.get_or_create(nom="Démo")
    return render(request, "app_portefeuille/index.html", {"portefeuille": pf})