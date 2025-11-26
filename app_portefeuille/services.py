from logging import info
import yfinance as yf
import pandas as pd
from .models import Actif, TypeActif


class ActifInconnu(Exception):
    #Lève cette exception si l'actif n'existe pas sur Yahoo Finance
    pass


#yahoo finance renvoie les types d actif avec quoteType, on mappe ces types aux nôtres
TYPE_MAP = {
    "EQUITY": TypeActif.ACTION,
    "ETF": TypeActif.ETF,
    "CRYPTOCURRENCY": TypeActif.CRYPTO,
    "BOND": TypeActif.OBLIGATION,
    "MUTUALFUND": TypeActif.FONDS,
    "INDEX": TypeActif.INDICE,
}


#Récupère les informations d'un actif financier à partir de son symbole (ticker)."""
def get_actif(symbole: str) -> Actif:
    symbole = symbole.upper()
    try:
        ticker= yf.Ticker(symbole)
        info = ticker.info
    except Exception:
        raise ActifInconnu(f"Impossible d'interroger Yahoo Finance pour '{symbole}'.")
    
    if info.get("regularMarketPrice") is None:
        # L'actif n'existe pas ou n'a pas de prix de marché régulier
        raise ActifInconnu(f"L'actif '{symbole}' est inconnu sur Yahoo Finance.")
    
    nom = info.get("longName", symbole)
    quote_type = (info.get("quoteType") or "").upper()
    type_actif = TYPE_MAP.get(quote_type, TypeActif.AUTRE)
    actif, _ = Actif.objects.get_or_create(
        symbole=symbole,
        defaults={"nom": nom, "type_actif": type_actif},
    )
    return actif


#Recupérer l'historique des prix d'un actif financier."""
def get_history(symbole, start="2015-01-01", end=None, interval="1mo"):
    symbole = symbole.upper()
    df = yf.download(symbole, start=start, end=end, interval=interval, progress=False)
    if df.empty:
        return pd.DataFrame()

    # On garde uniquement la colonne Adj Close (prix ajusté)
    df = df[["Adj Close"]].rename(columns={"Adj Close": "adj_close"})

    #NETTOYAGE DES DONNÉES
    df = df.dropna()
    return df 