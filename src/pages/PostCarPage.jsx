import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useCars, CAR_MAKES, UAE_CITIES } from '../context/CarContext';

const { FiArrowLeft, FiArrowRight, FiCheck, FiAlertCircle } = FiIcons;

const BODY_TYPES = ['Sedan', 'SUV', 'Pickup', 'Hatchback', 'Coupe', 'Van', 'Other'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
const TRANSMISSIONS = ['Automatic', 'Manual'];
const CONDITIONS = ['Used', 'New', 'Certified Pre-Owned'];
const COLORS = ['White', 'Black', 'Silver', 'Grey', 'Red', 'Blue', 'Green', 'Gold', 'Brown', 'Orange', 'Beige', 'Yellow', 'Other'];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => CURRENT_YEAR - i);

const PostCarPage = () => {
  const { addCar } = useCars();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    make: '', model: '', trim: '', year: '', body_type: '', condition: 'Used',
    price: '', mileage: '', fuel: 'Petrol', transmission: 'Automatic', color: '',
    location: '', description: '',
    seller_name: '', seller_phone: '', seller_whatsapp: '',
    features: []
  });

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validateStep = () => {
    const errs = {};
    if (step === 1) {
      if (!form.make) errs.make = 'Required';
      if (!form.model) errs.model = 'Required';
      if (!form.year) errs.year = 'Required';
      if (!form.body_type) errs.body_type = 'Required';
      if (!form.color) errs.color = 'Required';
    }
    if (step === 2) {
      if (!form.price || isNaN(form.price) || Number(form.price) <= 0) errs.price = 'Enter a valid price';
      if (!form.mileage || isNaN(form.mileage)) errs.mileage = 'Enter valid mileage';
      if (!form.location) errs.location = 'Required';
      if (!form.description || form.description.length < 30) errs.description = 'Please write at least 30 characters';
    }
    if (step === 3) {
      if (!form.seller_name) errs.seller_name = 'Required';
      if (!form.seller_phone || form.seller_phone.length < 9) errs.seller_phone = 'Enter a valid phone number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const submit = () => {
    if (!validateStep()) return;
    const title = `${form.year} ${form.make} ${form.model}${form.trim ? ' ' + form.trim : ''}`;
    addCar({
      ...form,
      title,
      price: Number(form.price),
      mileage: Number(form.mileage),
      year: Number(form.year),
      seller_whatsapp: form.seller_whatsapp || form.seller_phone,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiCheck} className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ad Submitted!</h2>
          <p className="text-gray-500 mb-6">
            Your car listing is pending review. Our team will verify and publish it within 24 hours.
            We'll contact you at <strong>{form.seller_phone}</strong> once it's live.
          </p>
          <Link
            to="/"
            className="block w-full bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition-colors"
          >
            Back to Homepage
          </Link>
        </motion.div>
      </div>
    );
  }

  const Field = ({ label, error, children, required }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
          <SafeIcon icon={FiAlertCircle} className="h-3.5 w-3.5" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );

  const inputCls = (err) =>
    `w-full border rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 ${err ? 'border-red-400' : 'border-gray-200'}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-1">
            <span className="text-xl font-black text-primary-600">cars</span>
            <span className="text-xl font-black text-gray-900">.me</span>
          </Link>
          <span className="text-sm text-gray-500 font-medium">Post a Free Ad</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Steps */}
        <div className="flex items-center justify-between mb-8">
          {['Car Details', 'Price & Description', 'Contact Info'].map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={n} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                  ${done ? 'bg-green-500 text-white' : active ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {done ? <SafeIcon icon={FiCheck} className="h-4 w-4" /> : n}
                </div>
                <div className={`hidden sm:block ml-2 text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-400'}`}>{label}</div>
                {i < 2 && <div className={`flex-1 h-0.5 mx-3 ${step > n ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>

        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-md p-6 sm:p-8"
        >
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Car Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Make" error={errors.make} required>
                  <select value={form.make} onChange={e => update('make', e.target.value)} className={inputCls(errors.make)}>
                    <option value="">Select make</option>
                    {CAR_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </Field>
                <Field label="Model" error={errors.model} required>
                  <input type="text" placeholder="e.g. Camry" value={form.model}
                    onChange={e => update('model', e.target.value)} className={inputCls(errors.model)} />
                </Field>
                <Field label="Year" error={errors.year} required>
                  <select value={form.year} onChange={e => update('year', e.target.value)} className={inputCls(errors.year)}>
                    <option value="">Select year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </Field>
                <Field label="Body Type" error={errors.body_type} required>
                  <select value={form.body_type} onChange={e => update('body_type', e.target.value)} className={inputCls(errors.body_type)}>
                    <option value="">Select type</option>
                    {BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Trim / Variant">
                  <input type="text" placeholder="e.g. SE, XSE, M Sport" value={form.trim}
                    onChange={e => update('trim', e.target.value)} className={inputCls()} />
                </Field>
                <Field label="Color" error={errors.color} required>
                  <select value={form.color} onChange={e => update('color', e.target.value)} className={inputCls(errors.color)}>
                    <option value="">Select color</option>
                    {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Fuel Type">
                  <select value={form.fuel} onChange={e => update('fuel', e.target.value)} className={inputCls()}>
                    {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="Transmission">
                  <select value={form.transmission} onChange={e => update('transmission', e.target.value)} className={inputCls()}>
                    {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Condition">
                <div className="flex gap-3">
                  {CONDITIONS.map(c => (
                    <button key={c} type="button" onClick={() => update('condition', c)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${form.condition === c ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Price & Description</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price (AED)" error={errors.price} required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">AED</span>
                    <input type="number" placeholder="85000" value={form.price}
                      onChange={e => update('price', e.target.value)}
                      className={`${inputCls(errors.price)} pl-12`} />
                  </div>
                </Field>
                <Field label="Mileage (km)" error={errors.mileage} required>
                  <input type="number" placeholder="45000" value={form.mileage}
                    onChange={e => update('mileage', e.target.value)} className={inputCls(errors.mileage)} />
                </Field>
              </div>
              <Field label="Location" error={errors.location} required>
                <select value={form.location} onChange={e => update('location', e.target.value)} className={inputCls(errors.location)}>
                  <option value="">Select city</option>
                  {UAE_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Description" error={errors.description} required>
                <textarea
                  rows={5}
                  placeholder="Describe your car — condition, service history, any accessories, reason for selling..."
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  className={`${inputCls(errors.description)} resize-none`}
                />
                <p className="mt-1 text-xs text-gray-400">{form.description.length} characters (min 30)</p>
              </Field>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Your Contact Info</h2>
              <p className="text-sm text-gray-500 mb-4">Buyers will contact you directly. Your info is kept private from search engines.</p>
              <Field label="Your Name" error={errors.seller_name} required>
                <input type="text" placeholder="Full name" value={form.seller_name}
                  onChange={e => update('seller_name', e.target.value)} className={inputCls(errors.seller_name)} />
              </Field>
              <Field label="Phone Number" error={errors.seller_phone} required>
                <input type="tel" placeholder="+971 50 123 4567" value={form.seller_phone}
                  onChange={e => update('seller_phone', e.target.value)} className={inputCls(errors.seller_phone)} />
              </Field>
              <Field label="WhatsApp Number">
                <input type="tel" placeholder="Same as phone (or different)"
                  value={form.seller_whatsapp}
                  onChange={e => update('seller_whatsapp', e.target.value)} className={inputCls()} />
                <p className="text-xs text-gray-400 mt-1">Leave blank to use the same number</p>
              </Field>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mt-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Listing Summary</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Car</span>
                    <span className="font-medium text-gray-900">{form.year} {form.make} {form.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price</span>
                    <span className="font-bold text-primary-600">AED {Number(form.price).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location</span>
                    <span>{form.location}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                By submitting, you agree that this listing is accurate. All ads are reviewed before publishing (usually within 24 hours).
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button onClick={back} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium">
                <SafeIcon icon={FiArrowLeft} className="h-4 w-4" />
                <span>Back</span>
              </button>
            ) : (
              <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium">
                <SafeIcon icon={FiArrowLeft} className="h-4 w-4" />
                <span>Cancel</span>
              </Link>
            )}
            {step < 3 ? (
              <button onClick={next}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
                <span>Continue</span>
                <SafeIcon icon={FiArrowRight} className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={submit}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
                <SafeIcon icon={FiCheck} className="h-4 w-4" />
                <span>Submit Ad</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PostCarPage;
