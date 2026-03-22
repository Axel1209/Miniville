import React from 'react';
import { X, BookOpen, AlertTriangle, Coins, Home, Building } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 sm:p-6">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3 text-indigo-700">
            <BookOpen size={24} className="text-indigo-600" />
            <h2 className="text-xl sm:text-2xl font-bold">Règles du Jeu</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 text-slate-700">
          
          {/* But du jeu */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Building size={20} className="text-indigo-500" />
              But du jeu
            </h3>
            <p className="leading-relaxed mb-2">
              Vous êtes le maire d'une ville en plein développement. Votre objectif est d'être le <strong>premier joueur à construire ses 4 Monuments</strong> :
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
              <li><strong>Aire de covoiturage</strong> (Coût : 5 pièces)</li>
              <li><strong>Siège EELV</strong> (Coût : 15 pièces)</li>
              <li><strong>Musée des Confluences</strong> (Coût : 30 pièces)</li>
              <li><strong>Mont Saint-Michel</strong> (Coût : 50 pièces)</li>
            </ul>
          </section>

          {/* Tour de jeu */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Home size={20} className="text-emerald-500" />
              Déroulement d'un tour
            </h3>
            <ol className="list-decimal list-inside space-y-3 ml-2">
              <li>
                <strong>Lancer les dés :</strong> Lancez 1 dé. Si vous avez construit l'<em>Aire de covoiturage</em>, vous pouvez choisir de lancer 1 ou 2 dés.
              </li>
              <li>
                <strong>Gagner des revenus :</strong> Le résultat des dés active les établissements correspondants (le numéro en haut à gauche des cartes).
              </li>
              <li>
                <strong>Construction :</strong> Vous pouvez acheter <strong>un seul</strong> établissement ou monument par tour, si vous avez assez de pièces.
              </li>
            </ol>
          </section>

          {/* Types de cartes */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Coins size={20} className="text-amber-500" />
              Les types d'établissements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                <h4 className="font-bold text-blue-800 mb-1">Bleu (Primaire)</h4>
                <p className="text-sm text-blue-900">Revenus pendant le tour de <strong>n'importe quel joueur</strong>.</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                <h4 className="font-bold text-emerald-800 mb-1">Vert (Secondaire)</h4>
                <p className="text-sm text-emerald-900">Revenus <strong>uniquement pendant votre tour</strong>.</p>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
                <h4 className="font-bold text-rose-800 mb-1">Rouge (Tertiaire)</h4>
                <p className="text-sm text-rose-900">Prenez des pièces au joueur qui a lancé les dés.</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl">
                <h4 className="font-bold text-purple-800 mb-1">Violet (Majeur)</h4>
                <p className="text-sm text-purple-900">Effets puissants, uniquement pendant votre tour. Limité à 1 exemplaire de chaque par joueur.</p>
              </div>
            </div>
          </section>

          {/* Mécanique Écologique */}
          <section className="bg-amber-50 border border-amber-200 p-4 sm:p-5 rounded-xl">
            <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-600" />
              Mécanique Spéciale : Réchauffement Climatique (RC)
            </h3>
            <p className="text-amber-800 text-sm mb-3">
              Certaines cartes polluantes (avec le symbole ⚠️) augmentent le Réchauffement Climatique global de <strong>0.1°C</strong> à chaque activation.
            </p>
            <ul className="list-disc list-inside text-sm text-amber-800 space-y-2">
              <li>Si le RC atteint <strong>2.0°C</strong>, des malus s'appliquent à tous les joueurs.</li>
              <li><em>Exemple :</em> L'Extraction de Caoutchouc ne rapporte plus rien, et l'Aéroport vous coûte une taxe carbone.</li>
              <li><strong>Attention à la Centrale Nucléaire :</strong> Elle rapporte beaucoup, mais si elle est activée 2 fois de suite, votre ville explose (vous perdez tout) et les bâtiments 6 de vos voisins sont détruits !</li>
            </ul>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm"
          >
            J'ai compris, jouer !
          </button>
        </div>
      </div>
    </div>
  );
};
