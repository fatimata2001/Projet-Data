from django.contrib import admin

# Register your models here.
from .models import Actif, Portefeuille,  PortefeuilleActif

# Afficher les lignes de PortefeuilleActif dans l'admin de Portefeuille
class PortefeuilleActifEnligne(admin.TabularInline):
    model = PortefeuilleActif
    extra = 1  # Nombre de lignes supplémentaires vides à afficher
    