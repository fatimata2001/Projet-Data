import yfinance as yf
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from .models import Actif, TypeActif

"""Pour la création d'actif -> ticker 
   Pour la simulation DCA//Lump sum -> yf.download
"""


_TYPE_MAP = {
    "EQUITY": TypeActif.ACTION,
    "ETF": TypeActif.ETF,
    "CRYPTOCURRENCY": TypeActif.CRYPTO,
    "BOND": TypeActif.OBLIGATION,
    "MUTUALFUND": TypeActif.FONDS,
    "INDEX": TypeActif.INDICE,
}


"""Récupère les informations d'un actif financier à partir de son symbole (ticker)."""
def get_actif(symbole):
    symbole = symbole.upper()
    t = yf.Ticker(symbole)
    info = t.info
    type_actif = _TYPE_MAP.get(info.get("quoteType"), TypeActif.AUTRE)


"""Recupérer l'historique des prix d'un actif financier."""
def get_history(symbole, start="2010-01-01", end=None, interval="1d"):
    symbole = symbole.upper()
    df = yf.download(symbole, start=start, end=end, interval=interval)
"""retourne un DataFrame pandas contenant l'historique des prix de l'actif."""
df 