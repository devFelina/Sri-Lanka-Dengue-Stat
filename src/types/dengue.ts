export interface DistrictMetrics {
  cases: number;
  cumulative: number;
  temp: number;
  rain: number;
  humidity: number;
  risk: 'High' | 'Medium' | 'Low';
}

export interface WeeklyDataPayload {
  end_date: string;
  districts: {
    [districtName: string]: DistrictMetrics;
  };
}

export interface DengueTimeSeriesDataset {
  [startDateIso: string]: WeeklyDataPayload;
}