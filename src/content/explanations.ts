// Explications pédagogiques par indicateur. Indexées par `Indicator.id`.
// Maintenues à la main pour rester courtes, justes et accessibles.

export interface Explanation {
  measures: string;
  why: string;
  read: string;
  takeaway: string;
  limits?: string;
}

export const explanations: Record<string, Explanation> = {
  "population-total": {
    measures: "Le nombre total d'habitants vivant au Sénégal une année donnée.",
    why: "C'est la base de toutes les politiques publiques : écoles, santé, logement, emploi.",
    read: "La courbe monte régulièrement. La pente indique la vitesse de croissance démographique.",
    takeaway: "La population sénégalaise est jeune et croît rapidement.",
    limits: "Estimations entre deux recensements (RGPH). Les valeurs récentes peuvent être révisées.",
  },
  "population-urbaine": {
    measures: "La part de la population qui vit en ville.",
    why: "L'urbanisation transforme l'économie, les transports, le logement.",
    read: "Plus la courbe monte, plus le pays s'urbanise. Une stagnation indique un équilibre.",
    takeaway: "Le Sénégal s'urbanise, surtout autour de Dakar et de la petite côte.",
  },
  "esperance-vie": {
    measures: "Nombre d'années qu'un nouveau-né vivrait dans les conditions de mortalité actuelles.",
    why: "Résume l'état de santé global d'une population.",
    read: "Une hausse continue traduit une amélioration des soins et une baisse de la mortalité infantile.",
    takeaway: "L'espérance de vie au Sénégal a fortement progressé depuis les années 1990.",
  },
  "pib-courant": {
    measures: "La valeur de tout ce qui est produit en une année, en dollars courants.",
    why: "Échelle de comparaison entre pays et indicateur de la taille de l'économie.",
    read: "Compare la valeur récente à celle d'il y a 10 ans. Une croissance régulière est un bon signe.",
    takeaway: "L'économie sénégalaise a presque doublé sur la dernière décennie.",
    limits: "Le PIB nominal varie aussi avec les taux de change ; il ne reflète pas la qualité de vie.",
  },
  "croissance-pib": {
    measures: "La variation du PIB en volume d'une année sur l'autre, en pourcentage.",
    why: "Mesure si l'économie produit plus ou moins de richesses qu'avant.",
    read: "Au-dessus de zéro, l'économie grandit. En-dessous, elle se contracte (récession).",
    takeaway: "Le Sénégal vise une croissance soutenue, dopée notamment par les hydrocarbures depuis 2024.",
    limits: "Les valeurs futures sont des projections du FMI, susceptibles de révision tous les six mois.",
  },
  "inflation": {
    measures: "L'évolution moyenne des prix à la consommation sur un an.",
    why: "Quand les prix augmentent vite, le pouvoir d'achat baisse.",
    read: "Une valeur entre 1 et 3 % est considérée comme saine. Au-delà de 5 %, l'érosion devient sensible.",
    takeaway: "Le Sénégal partage le franc CFA avec la BCEAO, ce qui aide à contenir l'inflation.",
  },
  "dette-publique": {
    measures: "Le montant total que doit l'État, exprimé en pourcentage du PIB.",
    why: "Mesure la marge de manœuvre budgétaire et le risque de surendettement.",
    read: "Au-delà de 70 % du PIB, le FMI considère que la vigilance s'impose pour les pays en développement.",
    takeaway: "La trajectoire de la dette est un indicateur clé surveillé par les bailleurs internationaux.",
  },
  "temp-dakar": {
    measures: "La température moyenne quotidienne à Dakar sur les 14 derniers jours.",
    why: "Permet de repérer les écarts par rapport à la saison habituelle.",
    read: "Comparez le pic et le creux à la moyenne saisonnière publiée par l'ANACIM.",
    takeaway: "Dakar bénéficie d'un climat océanique tempéré pour la sous-région.",
    limits: "Les modèles automatisés peuvent diverger de quelques dixièmes de degré des relevés station.",
  },
  "pluie-dakar": {
    measures: "Le cumul quotidien des précipitations à Dakar.",
    why: "Les pluies conditionnent l'agriculture, la santé publique et l'approvisionnement en eau.",
    read: "Hors hivernage (juin-octobre), la plupart des barres sont proches de zéro.",
    takeaway: "Le Sénégal a un climat sahélien : les pluies se concentrent sur quelques mois.",
  },
};

export function getExplanation(id: string): Explanation | undefined {
  return explanations[id];
}
