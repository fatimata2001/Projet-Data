from django.shortcuts import render
from .models import Portefeuille
# Create your views here.

def index(request):
    # Crée ou récupère un portefeuille "Démo"
    # pf : le portefeuille récupéré ou créé
    # _ : reçois un booléen indiquant si le portefeuille a été créé ou non
    pf, _ = Portefeuille.objects.get_or_create(nom="Démo")
    return render(request, "app_portefeuille/index.html", {"portefeuille": pf})