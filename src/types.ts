export interface Candidate {
  id: string;
  name: string;
  party: string;
  role: string;
  imageUrl: string;
  description: string;
  partyColor: string;
  territoryStrength: number;
  focusDistricts: string[];
  voterBuckets: {
    fixed: number;
    undecided: number;
    reject: number;
  };
}

export interface TerritoryProblem {
  label: string;
  count: number;
  color: string;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  type: 'choice' | 'text';
  options?: string[];
}

export type MapMode = 'districts' | 'heatmap';

export interface Stats {
  visitsToday: number;
  activeBrigades: number;
  globalCoverage: number;
  surveysCaptured: number;
  topProblems: TerritoryProblem[];
}

export interface PartyConfig {
  id: string;
  name: string;
  primaryColor: string;
  logoUrl: string;
  slogan: string;
}

export interface Brigadist {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
}

export interface Street {
  name: string;
  sides: 'left' | 'right' | 'both';
  status: 'pending' | 'done';
}

export interface ColonyAssignment {
  colonyName: string;
  streets: Street[];
}

export interface RouteItem {
  id: string;
  address: string;
  colonia: string;
  status: 'done' | 'current' | 'pending';
  order: number;
}

export interface SurveyAnswer {
  questionId: string;
  answer: string;
}

export interface District {
  id: string;
  name: string;
  color: string;
  status: 'hot' | 'active' | 'lag' | 'crit' | 'exc';
  visits: number;
  brigades: number;
  coverage: number;
  target: number;
  coordinator: string;
  coords: [number, number][];
}
