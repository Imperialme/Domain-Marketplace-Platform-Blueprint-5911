import React, { createContext, useContext, useState, useEffect } from 'react';

const CarContext = createContext();

export const useCars = () => {
  const context = useContext(CarContext);
  if (!context) throw new Error('useCars must be used within a CarProvider');
  return context;
};

export const CAR_MAKES = [
  'BMW', 'Chevrolet', 'Ford', 'Honda', 'Hyundai', 'Kia', 'Lexus',
  'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Range Rover', 'Suzuki',
  'Toyota', 'Volkswagen', 'Other'
];

export const UAE_CITIES = [
  'Abu Dhabi', 'Ajman', 'Dubai', 'Fujairah',
  'Ras Al Khaimah', 'Sharjah', 'Umm Al Quwain'
];

const STORAGE_KEY = 'carsme_listings';

const mockCars = [
  {
    id: 1,
    title: '2022 Toyota Land Cruiser VX',
    make: 'Toyota', model: 'Land Cruiser', trim: 'VX',
    year: 2022, price: 285000, mileage: 42000,
    condition: 'Used', location: 'Dubai', fuel: 'Petrol',
    transmission: 'Automatic', color: 'White', body_type: 'SUV',
    description: 'Excellent condition, single owner, full service history at Toyota dealer. GCC specs, accident free. All original, no modifications. Ready for transfer.',
    features: ['Sunroof', 'Leather Seats', 'Navigation', 'Rear Camera', 'Heated Seats', 'Blind Spot Monitor'],
    seller_name: 'Ahmed Al Mansouri', seller_phone: '+971501234567', seller_whatsapp: '+971501234567',
    status: 'active', created_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 2,
    title: '2021 Nissan Patrol Platinum',
    make: 'Nissan', model: 'Patrol', trim: 'Platinum',
    year: 2021, price: 195000, mileage: 68000,
    condition: 'Used', location: 'Abu Dhabi', fuel: 'Petrol',
    transmission: 'Automatic', color: 'Silver', body_type: 'SUV',
    description: 'Nissan Patrol Platinum in excellent condition. GCC specs. No accidents. Service done at Nissan official dealer. Priced to sell.',
    features: ['Sunroof', '7-Seater', 'Navigation', 'Rear Camera', 'Heated/Cooled Seats'],
    seller_name: 'Mohammed Al Rashidi', seller_phone: '+971551234567', seller_whatsapp: '+971551234567',
    status: 'active', created_at: '2025-01-18T09:00:00Z'
  },
  {
    id: 3,
    title: '2023 BMW 5 Series 530i M Sport',
    make: 'BMW', model: '5 Series', trim: '530i M Sport',
    year: 2023, price: 230000, mileage: 15000,
    condition: 'Used', location: 'Dubai', fuel: 'Petrol',
    transmission: 'Automatic', color: 'Black', body_type: 'Sedan',
    description: 'Nearly new BMW 5 Series M Sport. Under warranty, GCC specs. Full service history. Premium sound system, panoramic roof.',
    features: ['Panoramic Roof', 'M Sport Package', 'Harman Kardon Sound', 'Navigation', 'Adaptive Cruise Control'],
    seller_name: 'Faisal Al-Ahmad', seller_phone: '+971561234567', seller_whatsapp: '+971561234567',
    status: 'active', created_at: '2025-01-20T11:00:00Z'
  },
  {
    id: 4,
    title: '2022 Toyota Camry SE 2.5L',
    make: 'Toyota', model: 'Camry', trim: 'SE',
    year: 2022, price: 85000, mileage: 35000,
    condition: 'Used', location: 'Sharjah', fuel: 'Petrol',
    transmission: 'Automatic', color: 'Red', body_type: 'Sedan',
    description: 'Toyota Camry SE in excellent condition. Single owner, no accidents. Recent service done. Economy and comfort in one package.',
    features: ['Rear Camera', 'Apple CarPlay', 'Android Auto', 'Dual Zone A/C'],
    seller_name: 'Khalid Hassan', seller_phone: '+971521234567', seller_whatsapp: '+971521234567',
    status: 'active', created_at: '2025-01-22T08:00:00Z'
  },
  {
    id: 5,
    title: '2021 Mercedes-Benz C-Class C300',
    make: 'Mercedes-Benz', model: 'C-Class', trim: 'C300',
    year: 2021, price: 155000, mileage: 52000,
    condition: 'Used', location: 'Dubai', fuel: 'Petrol',
    transmission: 'Automatic', color: 'White', body_type: 'Sedan',
    description: 'Elegant Mercedes C300 in immaculate condition. Full Mercedes dealer service history. Under extended warranty. All keys and books.',
    features: ['AMG Package', 'Burmester Sound', 'Panoramic Roof', 'Night Package', 'Ambient Lighting'],
    seller_name: 'Omar Al-Farsi', seller_phone: '+971581234567', seller_whatsapp: '+971581234567',
    status: 'active', created_at: '2025-01-25T14:00:00Z'
  },
  {
    id: 6,
    title: '2022 Lexus LX 600 Luxury',
    make: 'Lexus', model: 'LX', trim: 'LX 600 Luxury',
    year: 2022, price: 450000, mileage: 28000,
    condition: 'Used', location: 'Dubai', fuel: 'Petrol',
    transmission: 'Automatic', color: 'White', body_type: 'SUV',
    description: 'Lexus LX 600 in showroom condition. The pinnacle of luxury SUVs. Under full Lexus warranty. GCC specifications.',
    features: ['4WD', 'Mark Levinson Sound', 'Massage Seats', 'Multi-terrain Select', 'HUD'],
    seller_name: 'Saeed Al-Maktoum', seller_phone: '+971541234567', seller_whatsapp: '+971541234567',
    status: 'active', created_at: '2025-01-28T10:00:00Z'
  },
  {
    id: 7,
    title: '2022 Honda Accord Sport 1.5T',
    make: 'Honda', model: 'Accord', trim: 'Sport',
    year: 2022, price: 92000, mileage: 40000,
    condition: 'Used', location: 'Ajman', fuel: 'Petrol',
    transmission: 'Automatic', color: 'Blue', body_type: 'Sedan',
    description: 'Honda Accord Sport in perfect condition. No accidents, service history available. Great fuel economy and performance.',
    features: ['Honda Sensing', 'Rear Camera', 'Apple CarPlay', 'Heated Seats', 'Sport Mode'],
    seller_name: 'Ravi Sharma', seller_phone: '+971571234567', seller_whatsapp: '+971571234567',
    status: 'active', created_at: '2025-02-01T09:00:00Z'
  },
  {
    id: 8,
    title: '2022 Chevrolet Tahoe LTZ',
    make: 'Chevrolet', model: 'Tahoe', trim: 'LTZ',
    year: 2022, price: 210000, mileage: 45000,
    condition: 'Used', location: 'Dubai', fuel: 'Petrol',
    transmission: 'Automatic', color: 'Black', body_type: 'SUV',
    description: 'Powerful Chevrolet Tahoe LTZ 7-seater. American specs. Perfect for families. Full service history. Ready for transfer.',
    features: ['4WD', '7-Seater', 'Bose Sound', 'Navigation', 'Heated Seats', 'Power Running Boards'],
    seller_name: 'John Williams', seller_phone: '+971531234567', seller_whatsapp: '+971531234567',
    status: 'active', created_at: '2025-02-05T11:00:00Z'
  },
  {
    id: 9,
    title: '2023 Kia Sportage GT-Line',
    make: 'Kia', model: 'Sportage', trim: 'GT-Line',
    year: 2023, price: 78000, mileage: 22000,
    condition: 'Used', location: 'Abu Dhabi', fuel: 'Petrol',
    transmission: 'Automatic', color: 'Grey', body_type: 'SUV',
    description: 'Nearly new Kia Sportage GT-Line with all the tech features. Under Kia warranty. Perfect daily driver.',
    features: ['Panoramic Roof', 'Navigation', 'Rear Camera', 'Wireless Charging', 'Heated Seats'],
    seller_name: 'Priya Kumar', seller_phone: '+971511234567', seller_whatsapp: '+971511234567',
    status: 'active', created_at: '2025-02-08T13:00:00Z'
  },
  {
    id: 10,
    title: '2023 Toyota Corolla XSE',
    make: 'Toyota', model: 'Corolla', trim: 'XSE',
    year: 2023, price: 68000, mileage: 18000,
    condition: 'Used', location: 'Sharjah', fuel: 'Petrol',
    transmission: 'Automatic', color: 'Grey', body_type: 'Sedan',
    description: 'Low mileage Toyota Corolla. Excellent condition. Fuel efficient and reliable. Under Toyota warranty.',
    features: ['Toyota Safety Sense', 'Apple CarPlay', 'Rear Camera', 'Automatic A/C'],
    seller_name: 'Amir Hassan', seller_phone: '+971561234568', seller_whatsapp: '+971561234568',
    status: 'active', created_at: '2025-02-10T10:00:00Z'
  },
  {
    id: 11,
    title: '2022 BMW 7 Series 740i M Sport',
    make: 'BMW', model: '7 Series', trim: '740i M Sport',
    year: 2022, price: 380000, mileage: 32000,
    condition: 'Used', location: 'Dubai', fuel: 'Petrol',
    transmission: 'Automatic', color: 'Black', body_type: 'Sedan',
    description: 'Ultimate luxury. BMW 740i M Sport in impeccable condition. Full BMW dealer history. Under warranty.',
    features: ['M Sport Package', 'Executive Package', 'Bowers & Wilkins Sound', 'Rear Entertainment', 'Massage Seats'],
    seller_name: 'Stefan Mueller', seller_phone: '+971551234568', seller_whatsapp: '+971551234568',
    status: 'active', created_at: '2025-02-12T09:00:00Z'
  },
  {
    id: 12,
    title: '2022 Range Rover Sport HSE',
    make: 'Range Rover', model: 'Range Rover Sport', trim: 'HSE',
    year: 2022, price: 320000, mileage: 38000,
    condition: 'Used', location: 'Dubai', fuel: 'Petrol',
    transmission: 'Automatic', color: 'White', body_type: 'SUV',
    description: 'Range Rover Sport HSE in excellent condition. Under Jaguar Land Rover warranty. Full service history.',
    features: ['Terrain Response', 'Meridian Sound', 'Panoramic Roof', 'Air Suspension', 'Heated Seats'],
    seller_name: 'James Harrison', seller_phone: '+971521234568', seller_whatsapp: '+971521234568',
    status: 'active', created_at: '2025-02-15T10:00:00Z'
  },
  {
    id: 13,
    title: '2022 Nissan Altima SR 2.5L',
    make: 'Nissan', model: 'Altima', trim: 'SR',
    year: 2022, price: 72000, mileage: 48000,
    condition: 'Used', location: 'Fujairah', fuel: 'Petrol',
    transmission: 'Automatic', color: 'White', body_type: 'Sedan',
    description: 'Nissan Altima SR in good condition. Single owner. Service up to date. Comfortable and reliable.',
    features: ['Rear Camera', 'Apple CarPlay', 'Dual Zone A/C', 'Heated Seats'],
    seller_name: 'Hassan Al-Zaabi', seller_phone: '+971581234568', seller_whatsapp: '+971581234568',
    status: 'active', created_at: '2025-02-18T11:00:00Z'
  },
  {
    id: 14,
    title: '2023 Hyundai Tucson N-Line',
    make: 'Hyundai', model: 'Tucson', trim: 'N-Line',
    year: 2023, price: 82000, mileage: 19000,
    condition: 'Used', location: 'Dubai', fuel: 'Petrol',
    transmission: 'Automatic', color: 'Blue', body_type: 'SUV',
    description: 'Hyundai Tucson N-Line with sporty styling and modern tech. Under Hyundai warranty. Like new condition.',
    features: ['Panoramic Roof', 'Navigation', 'Blind Spot Monitor', 'Rear Camera', 'N-Line Styling'],
    seller_name: 'Kim Park', seller_phone: '+971541234568', seller_whatsapp: '+971541234568',
    status: 'active', created_at: '2025-02-20T09:00:00Z'
  },
  {
    id: 15,
    title: '2021 Ford F-150 Lariat',
    make: 'Ford', model: 'F-150', trim: 'Lariat',
    year: 2021, price: 165000, mileage: 55000,
    condition: 'Used', location: 'Dubai', fuel: 'Petrol',
    transmission: 'Automatic', color: 'Grey', body_type: 'Pickup',
    description: 'Ford F-150 Lariat in excellent condition. 4WD with towing package. Perfect for those who need power and capability.',
    features: ['4WD', 'Towing Package', 'B&O Sound', 'Navigation', 'Heated/Cooled Seats'],
    seller_name: 'Mike Johnson', seller_phone: '+971571234568', seller_whatsapp: '+971571234568',
    status: 'active', created_at: '2025-02-22T10:00:00Z'
  },
  {
    id: 16,
    title: '2023 Toyota RAV4 Adventure',
    make: 'Toyota', model: 'RAV4', trim: 'Adventure',
    year: 2023, price: 118000, mileage: 12000,
    condition: 'Used', location: 'Abu Dhabi', fuel: 'Petrol',
    transmission: 'Automatic', color: 'Silver', body_type: 'SUV',
    description: 'Barely used Toyota RAV4 Adventure. All-wheel drive. Under full warranty. Perfect family SUV.',
    features: ['4WD', 'Toyota Safety Sense', 'Navigation', 'Rear Camera', 'Wireless Charging'],
    seller_name: 'Abdullah Al-Nuaimi', seller_phone: '+971531234568', seller_whatsapp: '+971531234568',
    status: 'active', created_at: '2025-02-25T11:00:00Z'
  },
  {
    id: 17,
    title: '2021 Mitsubishi Pajero GLS',
    make: 'Mitsubishi', model: 'Pajero', trim: 'GLS',
    year: 2021, price: 98000, mileage: 71000,
    condition: 'Used', location: 'Sharjah', fuel: 'Petrol',
    transmission: 'Automatic', color: 'Black', body_type: 'SUV',
    description: 'Mitsubishi Pajero GLS in good condition. GCC specs. Regular maintenance done.',
    features: ['4WD', 'Sunroof', 'Rear Camera', 'Navigation'],
    seller_name: 'Tariq Al-Balushi', seller_phone: '+971511234568', seller_whatsapp: '+971511234568',
    status: 'pending', created_at: '2025-02-28T09:00:00Z'
  },
  {
    id: 18,
    title: '2022 Volkswagen Tiguan R-Line',
    make: 'Volkswagen', model: 'Tiguan', trim: 'R-Line',
    year: 2022, price: 105000, mileage: 35000,
    condition: 'Used', location: 'Dubai', fuel: 'Petrol',
    transmission: 'Automatic', color: 'White', body_type: 'SUV',
    description: 'VW Tiguan R-Line in excellent condition. Full Volkswagen dealer service history.',
    features: ['Panoramic Roof', 'Digital Cockpit', 'Navigation', 'Heated Seats', 'R-Line Styling'],
    seller_name: 'Thomas Klein', seller_phone: '+971561234569', seller_whatsapp: '+971561234569',
    status: 'pending', created_at: '2025-03-01T10:00:00Z'
  }
];

export const CarProvider = ({ children }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCars(JSON.parse(stored));
      } catch {
        setCars(mockCars);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCars));
      }
    } else {
      setCars(mockCars);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCars));
    }
  }, []);

  const saveCars = (updated) => {
    setCars(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addCar = (carData) => {
    const newCar = {
      id: Date.now(),
      ...carData,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    saveCars([...cars, newCar]);
    return newCar;
  };

  const updateCar = (id, updates) => {
    saveCars(cars.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCar = (id) => {
    saveCars(cars.filter(c => c.id !== id));
  };

  const getCarById = (id) => cars.find(c => c.id === Number(id));

  const activeCars = cars.filter(c => c.status === 'active');
  const pendingCars = cars.filter(c => c.status === 'pending');

  return (
    <CarContext.Provider value={{ cars, activeCars, pendingCars, loading, addCar, updateCar, deleteCar, getCarById }}>
      {children}
    </CarContext.Provider>
  );
};
