import React, { useState } from 'react';

const ConfigurateurEnceintes = () => {
  const [config, setConfig] = useState({
    impedance: 8,
    puissanceAmp: 100,
    nombreVoies: 2,
    amplitudeEcoute: 'moyenne',
    styleMusical: 'neutre',
    typeEnceinte: 'bibliothèque',
    budgetNiveau: 'moyen',
    distanceAuMur: 'moyenne',
    utilisationPrincipale: 'musique',
    showAdvanced: false
  });
  
  const [recommandations, setRecommandations] = useState({
    volume: 40,
    materiaux: ['MDF 19mm'],
    typeCharge: 'Bass-reflex',
    ventilation: true,
    surfaceEvent: 25,
    diametreEvent: 5.6,
    longueurEvent: 12.5,
    freqAccord: 45,
    impedanceGlobale: '8 Ω',
    puissanceAdmissible: '120 W RMS',
    freqCoupure: ['3000 Hz'],
    penteFiltre: '12 dB/octave',
    efficacite: '88 dB/W/m',
    hautParleurs: [
      {
        type: 'Woofer 6.5" à 8"',
        impedance: '8 Ω',
        puissance: '80W RMS',
        sensibilite: '89 dB/W/m'
      },
      {
        type: 'Tweeter à dôme soie/alu',
        impedance: '8 Ω',
        puissance: '50W RMS',
        sensibilite: '91 dB/W/m'
      }
    ]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig({
      ...config,
      [name]: ['impedance', 'puissanceAmp', 'nombreVoies'].includes(name) 
        ? parseInt(value, 10) 
        : value
    });
    
    // Calcul simple du volume (en litres)
    let volume = 30;
    if (config.puissanceAmp > 100) volume = 50;
    if (config.nombreVoies > 2) volume += 15;
    if (config.amplitudeEcoute === 'forte') volume += 10;
    
    // Ajustement pour distance au mur
    if (config.distanceAuMur === 'proche') volume -= 5;
    if (config.distanceAuMur === 'éloignée') volume += 8;
    
    // Ajustement pour utilisation principale
    if (config.utilisationPrincipale === 'homecinema') volume += 12;
    if (config.utilisationPrincipale === 'studio') volume -= 5;
    
    // Mise à jour des recommandations
    let materiaux = ['MDF 19mm'];
    
    // Ajustement des matériaux selon la puissance et le budget
    if (config.puissanceAmp > 150 || config.budgetNiveau === 'élevé') {
      materiaux = ['MDF 25mm', 'Renforts internes'];
    }
    
    // Ajout d'amortissement pour hi-fi ou studio
    if (config.styleMusical === 'hifi' || config.utilisationPrincipale === 'studio') {
      materiaux.push('Amortissement acoustique interne');
    }
    
    // Ajustement de la pente des filtres selon le budget
    let penteFiltre = '12 dB/octave';
    if (config.budgetNiveau === 'élevé') {
      penteFiltre = config.nombreVoies >= 3 ? '24 dB/octave' : '18 dB/octave';
    }
    
    setRecommandations({
      ...recommandations,
      volume: volume,
      materiaux: materiaux,
      penteFiltre: penteFiltre,
      hautParleurs: config.nombreVoies === 1 
        ? [
            {
              type: 'Haut-parleur large bande 4" à 6"',
              technologie: 'Membrane en papier traité ou polypropylène',
              impedance: config.impedance + ' Ω',
              puissance: Math.round(config.puissanceAmp * 0.8) + 'W RMS',
              sensibilite: '88 dB/W/m',
              resonance: '65 Hz'
            }
          ]
        : config.nombreVoies === 2 
        ? [
            {
              type: 'Woofer ' + (config.styleMusical === 'bass' ? '8" à 10"' : '6.5" à 8"'),
              technologie: config.styleMusical === 'bass' ? 'Membrane polypropylène à longue excursion' : 'Membrane papier ou polypropylène',
              impedance: config.impedance + ' Ω',
              puissance: Math.round(config.puissanceAmp * 0.8) + 'W RMS',
              sensibilite: '89 dB/W/m',
              resonance: '45 Hz'
            },
            {
              type: config.styleMusical === 'hifi' || config.budgetNiveau === 'élevé' ? 'Tweeter à dôme soie de qualité' : 'Tweeter à dôme soie/alu',
              technologie: getTweeterTechnologie(config.styleMusical, config.budgetNiveau),
              impedance: config.impedance + ' Ω',
              puissance: Math.round(config.puissanceAmp * 0.5) + 'W RMS',
              sensibilite: '91 dB/W/m',
              resonance: '1200 Hz'
            }
          ]
        : config.nombreVoies === 3
        ? [
            {
              type: 'Woofer 8"',
              technologie: 'Membrane papier/kevlar avec suspension caoutchouc',
              impedance: config.impedance + ' Ω',
              puissance: Math.round(config.puissanceAmp * 0.7) + 'W RMS',
              sensibilite: '89 dB/W/m',
              resonance: '40 Hz'
            },
            {
              type: 'Médium 4"',
              technologie: config.budgetNiveau === 'élevé' ? 'Membrane en fibre de verre/alu' : 'Membrane en polypropylène',
              impedance: config.impedance + ' Ω',
              puissance: Math.round(config.puissanceAmp * 0.4) + 'W RMS',
              sensibilite: '90 dB/W/m',
              resonance: '150 Hz'
            },
            {
              type: config.styleMusical === 'hifi' || config.budgetNiveau === 'élevé' ? 'Tweeter à dôme soie de qualité' : 'Tweeter à dôme soie/alu',
              technologie: getTweeterTechnologie(config.styleMusical, config.budgetNiveau),
              impedance: config.impedance + ' Ω',
              puissance: Math.round(config.puissanceAmp * 0.3) + 'W RMS',
              sensibilite: '91 dB/W/m',
              resonance: '1200 Hz'
            }
          ]
        : [
            {
              type: 'Woofer 10"',
              technologie: 'Membrane en cellulose traitée avec suspension double',
              impedance: config.impedance + ' Ω',
              puissance: Math.round(config.puissanceAmp * 0.6) + 'W RMS',
              sensibilite: '90 dB/W/m',
              resonance: '35 Hz'
            },
            {
              type: 'Médium grave 5"',
              technologie: 'Membrane en polypropylène ou fibre composite',
              impedance: config.impedance + ' Ω',
              puissance: Math.round(config.puissanceAmp * 0.4) + 'W RMS',
              sensibilite: '89 dB/W/m',
              resonance: '100 Hz'
            },
            {
              type: 'Médium aigu 3"',
              technologie: config.budgetNiveau === 'élevé' ? 'Dôme textile ou membrane composite' : 'Membrane polypropylène',
              impedance: config.impedance + ' Ω',
              puissance: Math.round(config.puissanceAmp * 0.3) + 'W RMS',
              sensibilite: '90 dB/W/m',
              resonance: '800 Hz'
            },
            {
              type: config.styleMusical === 'hifi' || config.budgetNiveau === 'élevé' ? 'Tweeter à dôme soie de qualité' : 'Tweeter à dôme soie/alu',
              technologie: getTweeterTechnologie(config.styleMusical, config.budgetNiveau),
              impedance: config.impedance + ' Ω',
              puissance: Math.round(config.puissanceAmp * 0.2) + 'W RMS',
              sensibilite: '92 dB/W/m',
              resonance: '1500 Hz'
            }
          ]
    });
  // Mettre à jour les paramètres de configuration
  const handleChange = (e) => {

  const handleVoiesClick = (voies) => {
    setConfig({...config, nombreVoies: voies});
    
    // Mettre à jour les fréquences de coupure en fonction du nombre de voies
    let freqCoupure = [];
    if (voies === 2) {
      freqCoupure = ['3000 Hz'];
    } else if (voies === 3) {
      freqCoupure = ['500 Hz', '3500 Hz'];
    } else if (voies >= 4) {
      freqCoupure = ['300 Hz', '1200 Hz', '5000 Hz'];
    }
    
    setRecommandations({
      ...recommandations,
      freqCoupure: freqCoupure
    });
  };

  const toggleAdvanced = () => {
    setConfig({...config, showAdvanced: !config.showAdvanced});
  };

  return (
    <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto bg-gray-50 rounded-lg overflow-hidden shadow-lg">
      {/* Panneau de configuration - côté gauche */}
      <div className="w-full md:w-1/2 p-6 bg-white">
        <h2 className="text-2xl font-bold mb-6 text-blue-800">Paramètres de l'Enceinte</h2>
        
        <div className="space-y-4">
          {/* Impédance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impédance de sortie: {config.impedance} Ω
            </label>
            <input
              type="range"
              name="impedance"
              min="4"
              max="16"
              step="4"
              value={config.impedance}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>4 Ω</span>
              <span>8 Ω</span>
              <span>16 Ω</span>
            </div>
          </div>
          
          {/* Puissance de l'amplificateur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Puissance de l'amplificateur: {config.puissanceAmp} W
            </label>
            <input
              type="range"
              name="puissanceAmp"
              min="20"
              max="250"
              step="10"
              value={config.puissanceAmp}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>20 W</span>
              <span>150 W</span>
              <span>250 W</span>
            </div>
          </div>
          
          {/* Nombre de voies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de voies: {config.nombreVoies}
            </label>
            <div className="flex space-x-4">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  className={`py-2 px-4 rounded-md ${
                    config.nombreVoies === num
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => handleVoiesClick(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          
          {/* Amplitude d'écoute */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amplitude d'écoute préférée
            </label>
            <select
              name="amplitudeEcoute"
              value={config.amplitudeEcoute}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="faible">Faible (écoute discrète)</option>
              <option value="moyenne">Moyenne (écoute normale)</option>
              <option value="forte">Forte (volume élevé)</option>
            </select>
          </div>
          
          {/* Style musical */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Style musical préféré
            </label>
            <select
              name="styleMusical"
              value={config.styleMusical}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="neutre">Neutre / Polyvalent</option>
              <option value="hifi">Haute-fidélité / Acoustique</option>
              <option value="bass">Bass renforcé / Électronique</option>
              <option value="vocal">Vocal / Parole</option>
            </select>
          </div>
          
          {/* Type d'enceinte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d'enceinte
            </label>
            <select
              name="typeEnceinte"
              value={config.typeEnceinte}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="bibliothèque">Bibliothèque / Compacte</option>
              <option value="colonne">Colonne</option>
              <option value="murale">Murale</option>
              <option value="monitoring">Monitoring studio</option>
            </select>
          </div>
          
          {/* Budget/Niveau d'exigence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau de budget / exigence
            </label>
            <select
              name="budgetNiveau"
              value={config.budgetNiveau}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="entrée">Entrée de gamme</option>
              <option value="moyen">Milieu de gamme</option>
              <option value="élevé">Haut de gamme</option>
            </select>
          </div>
          
          {/* Distance au mur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distance au mur arrière
            </label>
            <select
              name="distanceAuMur"
              value={config.distanceAuMur}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="proche">Proche (&lt; 20 cm)</option>
              <option value="moyenne">Moyenne (20-50 cm)</option>
              <option value="éloignée">Éloignée (&gt; 50 cm)</option>
            </select>
          </div>
          
          {/* Utilisation principale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Utilisation principale
            </label>
            <select
              name="utilisationPrincipale"
              value={config.utilisationPrincipale}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="musique">Musique</option>
              <option value="homecinema">Home-cinéma</option>
              <option value="mixte">Mixte (Musique + Home-cinéma)</option>
              <option value="studio">Production / Mixage studio</option>
            </select>
          </div>
          
          {/* Extension des basses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Extension des basses
            </label>
            <select
              name="frequenceCoupureBasse"
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="30">Très profonde (30 Hz - idéal pour home-cinéma)</option>
              <option value="40">Profonde (40 Hz - bien équilibrée)</option>
              <option value="50" selected>Moyenne (50 Hz - standard)</option>
              <option value="60">Modérée (60 Hz - compact/monitoring)</option>
              <option value="80">Limitée (80 Hz - petites enceintes)</option>
            </select>
          </div>
          
          {/* Bouton pour afficher/masquer les paramètres avancés */}
          <div className="mt-8">
            <button 
              onClick={toggleAdvanced}
              className="flex items-center justify-center w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              {config.showAdvanced ? 'Masquer les paramètres avancés' : 'Afficher les paramètres avancés'} 
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 ml-2 transition-transform ${config.showAdvanced ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {/* Section des paramètres avancés */}
          {config.showAdvanced && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Paramètres avancés</h3>
              
              {/* Type de filtre */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caractère sonore des filtres
                </label>
                <select
                  name="typeFiltre"
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="butterworth" selected>Équilibré (Butterworth)</option>
                  <option value="linkwitz">Précis avec phase linéaire (Linkwitz-Riley)</option>
                  <option value="bessel">Doux et naturel (Bessel)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Influence la transition entre les haut-parleurs et le caractère sonore global
                </p>
              </div>
              
              {/* Facteur de qualité (Q) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comportement des graves
                </label>
                <select
                  name="facteurQualite"
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="bas">Graves étendus mais moins percutants (Q bas)</option>
                  <option value="moyen" selected>Graves équilibrés (Q moyen)</option>
                  <option value="haut">Graves plus percutants mais moins étendus (Q haut)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Détermine la réponse du haut-parleur de grave et la qualité de la résonance
                </p>
              </div>
              
              {/* Mode couplage/découplage */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interaction avec le support
                </label>
                <select
                  name="modeCouplage"
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="decouples">Isolation vibratoire (découplé)</option>
                  <option value="standard" selected>Standard (partiellement couplé)</option>
                  <option value="couples">Transmission vibratoire (couplé)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Influence la transmission des vibrations entre l'enceinte et son support
                </p>
              </div>
              
              {/* Paramètres Thiele-Small */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Optimisation des haut-parleurs
                </label>
                <select
                  name="parametresTS"
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="compacte">Pour enceinte compacte (haut-parleurs à faible Vas)</option>
                  <option value="moyenne" selected>Polyvalent (paramètres TS équilibrés)</option>
                  <option value="volume">Pour volume important (haut-parleurs à Vas élevé)</option>
                  <option value="sensibilite">Priorité à la sensibilité/efficacité</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Oriente le choix des haut-parleurs selon leurs caractéristiques électromécaniques
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Résultats - côté droit */}
      <div className="w-full md:w-1/2 p-6 bg-blue-50">
        <h2 className="text-2xl font-bold mb-6 text-blue-800">Recommandations</h2>
        
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold text-lg text-blue-700 mb-2">Caractéristiques physiques</h3>
            <p className="mb-1"><span className="font-medium">Volume optimal:</span> {recommandations.volume} litres</p>
            <p className="mb-1"><span className="font-medium">Matériaux recommandés:</span> {recommandations.materiaux.join(', ')}</p>
            <p><span className="font-medium">Type de charge:</span> {recommandations.typeCharge}</p>
            
            {recommandations.ventilation && (
              <div className="mt-2 ml-4 text-sm">
                <p><span className="font-medium">Surface d'évent:</span> {recommandations.surfaceEvent} cm²</p>
                <p><span className="font-medium">Diamètre équivalent:</span> {recommandations.diametreEvent} cm</p>
                <p><span className="font-medium">Longueur recommandée:</span> {recommandations.longueurEvent} cm</p>
                <p><span className="font-medium">Fréquence d'accord:</span> {recommandations.freqAccord} Hz</p>
              </div>
            )}
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold text-lg text-blue-700 mb-2">Configuration électronique</h3>
            <p className="mb-1"><span className="font-medium">Impédance globale:</span> {recommandations.impedanceGlobale}</p>
            <p className="mb-1"><span className="font-medium">Puissance admissible:</span> {recommandations.puissanceAdmissible}</p>
            {recommandations.freqCoupure.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Fréquences de coupure:</p>
                <ul className="list-disc pl-5">
                  {recommandations.freqCoupure.map((freq, index) => (
                    <li key={index}>{freq}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mb-1"><span className="font-medium">Pente des filtres:</span> {recommandations.penteFiltre}</p>
            <p className="mb-1"><span className="font-medium">Efficacité estimée:</span> {recommandations.efficacite}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold text-lg text-blue-700 mb-2">Haut-parleurs recommandés</h3>
            <div className="space-y-4">
              {recommandations.hautParleurs.map((hp, index) => (
                <div key={index} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                  <h4 className="font-medium">{hp.type}</h4>
                  <div className="ml-4 mt-1 text-sm grid grid-cols-2 gap-x-4 gap-y-1">
                    <p><span className="text-gray-600">Technologie:</span> {hp.technologie}</p>
                    <p><span className="text-gray-600">Impédance:</span> {hp.impedance}</p>
                    <p><span className="text-gray-600">Puissance:</span> {hp.puissance}</p>
                    <p><span className="text-gray-600">Sensibilité:</span> {hp.sensibilite}</p>
                    <p><span className="text-gray-600">Fréq. résonance:</span> {hp.resonance}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-100 p-4 rounded-lg border border-blue-300">
            <p className="text-sm text-blue-800 italic">
              Ces recommandations sont fournies à titre indicatif. 
              Pour des résultats optimaux, consultez un spécialiste en acoustique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurateurEnceintes;