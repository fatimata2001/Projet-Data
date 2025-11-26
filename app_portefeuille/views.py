from django.shortcuts import render
from .models import Portefeuille
from .services import get_actif, get_history



def get_actif_and_history(symbole):
    actif = get_actif(symbole)
    history = get_history(symbole)
    return actif, history

def index(request):
    # Crée ou récupère un portefeuille "Démo"
    # pf : le portefeuille récupéré ou créé
    # _ : reçois un booléen indiquant si le portefeuille a été créé ou non

    pf, _ = Portefeuille.objects.get_or_create(nom="Démo")
    return render(request, "app_portefeuille/index.html", {"portefeuille": pf})

def simulation(request):
    return render(request, "app_portefeuille/simulation.html")
