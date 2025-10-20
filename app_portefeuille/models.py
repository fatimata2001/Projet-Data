from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

#type actif : défini par yfinance avec quoteType 
class TypeActif(models.TextChoices):
    ## yfinance: EQUITY'
    ACTION = 'ACTION', 'Action'  
    # yfinance: 'ETF'
    ETF = 'ETF','ETF'
    # yfinance: 'BOND'
    OBLIGATION = 'OBLIGATION', 'Obligation'
    # yfinance: 'CRYPTOCURRENCY'
    CRYPTO = 'CRYPTO', 'Crypto'
    # yfinance: 'MUTUALFUND'
    FONDS = 'FONDS', 'Fonds'     
    # yfinance: 'INDEX'           
    INDICE = 'INDICE', 'Indice' 
    AUTRE = 'AUTRE', 'Autre'


# Create your models here.
#modèle pour les actifs financiers dans lesquels on investit
class Actif(models.Model):
    #nom complet de l'actif
    nom = models.CharField(max_length=100)  
    symbole = models.CharField(max_length=20, unique=True)
    type_actif = models.CharField(
        max_length=20,
        choices=TypeActif.choices,
        default=TypeActif.AUTRE,
    ) 

    def __str__(self):
        return f"{self.nom} ({self.symbole})"

#modèle pour le portefeuille qui regroupe plusieurs actifs
class Portefeuille(models.Model):
    nom = models.CharField(max_length=100)
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nom

#modèle pour la position d'un actif dans un portefeuille spécifique
class PortefeuilleActif(models.Model):
    portefeuille = models.ForeignKey(Portefeuille, on_delete=models.CASCADE, related_name='lignes')
    actif = models.ForeignKey(Actif, on_delete=models.CASCADE, related_name='positions')
    prix_entree = models.DecimalField(max_digits=20, decimal_places=4, null=True, blank=True)
    #pourcentage de l'actif dans le portefeuille
    poids = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])
    date_ajout = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["portefeuille", "actif"], name="unique_actif_par_portefeuille"),
        ]

    def __str__(self):
        return f"{self.portefeuille.nom} - {self.actif.nom} ({self.poids}%)" 

