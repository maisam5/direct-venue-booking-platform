export interface Country {
  value: string;
  label: string;
  region: string;
  latlng: [number, number];
  defaultAddress: string;
}

const COUNTRIES_AND_DISTRICTS: Country[] = [
  {
    value: "Waterfront",
    label: "New York Waterfront",
    region: "United States",
    latlng: [40.7081, -74.0018],
    defaultAddress: "Pier 9 North Basin, Waterfront",
  },
  {
    value: "Downtown",
    label: "Downtown Arts District",
    region: "United States",
    latlng: [40.7209, -74.0007],
    defaultAddress: "412 Mercer St, Downtown",
  },
  {
    value: "North Hills",
    label: "North Hills Botanical District",
    region: "United States",
    latlng: [40.7829, -73.9654],
    defaultAddress: "88 Conservatory Way, North Hills",
  },
  {
    value: "Old Town",
    label: "Old Town Heritage Quarter",
    region: "United States",
    latlng: [40.7359, -73.9911],
    defaultAddress: "19 Foundry Lane, Old Town",
  },
  {
    value: "Riverside",
    label: "Riverside Promenade",
    region: "United States",
    latlng: [40.8007, -73.9718],
    defaultAddress: "240 Riverbank Esplanade, Riverside",
  },
  {
    value: "Lakeside",
    label: "Lakeside Pavilion District",
    region: "United States",
    latlng: [41.8818, -87.6278],
    defaultAddress: "700 Lakeshore Terrace, Lakeside",
  },
  {
    value: "Lahore Gulberg",
    label: "Lahore · Gulberg & DHA",
    region: "Pakistan",
    latlng: [31.5085, 74.3489],
    defaultAddress: "Main Boulevard Gulberg III, Lahore",
  },
  {
    value: "Karachi Clifton",
    label: "Karachi · Clifton & Sea View",
    region: "Pakistan",
    latlng: [24.8138, 67.0303],
    defaultAddress: "Block 4 Clifton Marine Drive, Karachi",
  },
  {
    value: "Islamabad F-7",
    label: "Islamabad · Margalla & F-7",
    region: "Pakistan",
    latlng: [33.7215, 73.0563],
    defaultAddress: "Street 14 Sector F-7/2, Islamabad",
  },
  {
    value: "London Mayfair",
    label: "London · Mayfair & Soho",
    region: "United Kingdom",
    latlng: [51.5099, -0.1471],
    defaultAddress: "24 Bruton Place, Mayfair, London",
  },
  {
    value: "Dubai Marina",
    label: "Dubai · Downtown & Marina",
    region: "United Arab Emirates",
    latlng: [25.0805, 55.1403],
    defaultAddress: "Marina Promenade Boulevard, Dubai",
  },
];

export default function useCountries() {
  const getAll = () => COUNTRIES_AND_DISTRICTS;

  const getByValue = (value: string) => {
    if (!value) return undefined;
    const normalized = value.toLowerCase();
    return (
      COUNTRIES_AND_DISTRICTS.find(
        (item) =>
          item.value.toLowerCase() === normalized ||
          item.label.toLowerCase().includes(normalized)
      ) ?? {
        value,
        label: value,
        region: "Verified District",
        latlng: [40.7128, -74.006] as [number, number],
        defaultAddress: `${value} District`,
      }
    );
  };

  return {
    getAll,
    getByValue,
  };
}
