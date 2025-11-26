from django.contrib import admin

# Register your models here.
from .models import Actif, Portefeuille,  PortefeuilleActif

# Afficher les lignes de PortefeuilleActif dans l'admin de Portefeuille
class PortefeuilleActifEnligne(admin.TabularInline):
    model = PortefeuilleActif
    extra = 1  # Nombre de lignes supplémentaires vides à afficher
    autocomplete_fields = ['actif']  # Permet de rechercher les actifs par symbole ou nom
    fields = ('actif', 'prix_entree', 'poids', 'date_ajout')
    readonly_fields = ('date_ajout',)

@admin.register(Portefeuille)
class PortefeuilleAdmin(admin.ModelAdmin):
    list_display = ('nom', 'date_creation')
    search_fields = ('nom',)
    ordering = ('-date_creation',)
    readonly_fields = ('date_creation',)    
    inlines = [PortefeuilleActifEnligne]
    

@admin.register(Actif)
class ActifAdmin(admin.ModelAdmin):
    list_display = ('nom', 'symbole', 'type_actif')
    search_fields = ('nom', 'symbole')
    list_filter = ('type_actif',)
    ordering = ('nom',)

@admin.register(PortefeuilleActif)
class PortefeuilleActifAdmin(admin.ModelAdmin):
    list_display = ("portefeuille", "actif", "poids", "prix_entree", "date_ajout")
    list_filter = ("portefeuille", "actif")
    search_fields = ("portefeuille__nom", "actif__nom", "actif__symbole")
    ordering = ("-date_ajout",)
    autocomplete_fields = ("portefeuille", "actif")
    readonly_fields = ("date_ajout",)

