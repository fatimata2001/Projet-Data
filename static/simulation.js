// simulation.js - Version intégrée avec les modèles Django

// Helpers pour le formatage
const € = n => n.toLocaleString("fr-FR", {style:"currency", currency:"EUR", maximumFractionDigits:0});
const pct = x => (x*100).toFixed(2) + "%";

let growthChart, returnsChart;

// Initialisation - Charge les actifs depuis la base Django
document.addEventListener('DOMContentLoaded', function() {
    chargerActifsDepuisDjango();
});

// Charge les actifs depuis l'API Django
async function chargerActifsDepuisDjango() {
    try {
        const response = await fetch('/api/actifs/');  // Votre binôme créera cette API
        const actifs = await response.json();
        peuplerSelectActifs(actifs);
    } catch (error) {
        console.log('En attente de l\'API actifs...');
        // En attendant, select vide
        document.getElementById('selectActif').innerHTML = '<option value="">Chargement des actifs...</option>';
    }
}

// Peuple le select avec les actifs de la base
function peuplerSelectActifs(actifs) {
    const select = document.getElementById('selectActif');
    select.innerHTML = '<option value="">Sélectionnez un actif</option>';

    actifs.forEach(actif => {
        const option = document.createElement('option');
        option.value = actif.id;
        option.textContent = `${actif.nom} (${actif.symbole}) - ${actif.type_actif}`;
        select.appendChild(option);
    });
}

// Simulation via l'API Django de votre binôme
async function lancerSimulation() {
    const params = getParams();

    try {
        // Appel à l'API de simulation de votre binôme
        const response = await fetch('/api/simuler/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify(params)
        });

        const resultats = await response.json();

        // Affichage des résultats
        renderCharts(resultats);
        updateTiles(resultats);

    } catch (error) {
        console.log('API simulation non disponible encore');
    }
}

// Fonctions d'affichage pour les données de votre binôme
function renderCharts(data) {
    // data doit contenir: yearsLabels, points, lumpPts
    const { yearsLabels, points, lumpPts } = data;

    // Graphique de croissance
    const ctx1 = document.getElementById("chartGrowth");
    if (growthChart) growthChart.destroy();

    growthChart = new Chart(ctx1, {
        type: "line",
        data: {
            labels: yearsLabels,
            datasets: [
                {
                    label: "DCA",
                    data: points,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                },
                {
                    label: "Lump Sum",
                    data: lumpPts,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom" }
            }
        }
    });

    // Graphique des rendements (si fourni par le backend)
    if (data.rendements) {
        const ctx2 = document.getElementById("chartReturns");
        if (returnsChart) returnsChart.destroy();

        returnsChart = new Chart(ctx2, {
            type: "bar",
            data: {
                labels: data.labelsRendements || yearsLabels.slice(1),
                datasets: [{
                    label: "Rendement annuel",
                    data: data.rendements,
                    backgroundColor: data.rendements.map(r => r >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
                    borderColor: data.rendements.map(r => r >= 0 ? '#10b981' : '#ef4444'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } }
            }
        });
    }
}

function updateTiles(data) {
    // data doit contenir: invested, finalValue, cagr, sharpe
    document.getElementById("tInvested").textContent = €(data.invested);
    document.getElementById("tFinal").textContent = €(data.finalValue);
    document.getElementById("tCAGR").textContent = pct(data.cagr);
    document.getElementById("tSharpe").textContent = data.sharpe.toFixed(2);
}

// Récupère les paramètres du formulaire
function getParams() {
    const f = document.getElementById("formParams");
    return {
        initial: Number(f.initial.value || 0),
        recurring: Number(f.recurring.value || 0),
        years: Number(f.years.value || 1),
        feePct: Number(f.feePct.value || 0) / 100,
        freq: f.freq.value,
        actif_id: f.actif.value,  // ID de l'actif Django
        begin: document.getElementById("dcaBegin").checked,
        from_year: document.getElementById("fromYear").value,
        to_year: document.getElementById("toYear").value,
        currency: document.querySelector('input[name="currency"]:checked').value,
        tx_fee: document.getElementById("txFee").value,
        mgmt_fee: document.getElementById("mgmtFee").value
    };
}

// Helper pour le token CSRF
function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

// Événements
document.getElementById("formParams").addEventListener("submit", (e) => {
    e.preventDefault();
    lancerSimulation();
});

document.getElementById("dcaBegin").addEventListener("change", lancerSimulation);

// Export pour votre binôme
window.simulationApp = {
    lancerSimulation,
    getParams,
    renderCharts,
    updateTiles
};