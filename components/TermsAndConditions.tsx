import React from 'react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';

const TermsAndConditions: React.FC = () => {
  return (
    <Section className="pt-32 pb-20 bg-dark-900 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <Reveal>
          <h1 className="text-4xl md:text-5xl font-black uppercase text-white mb-8">Terms and Conditions (Beta)</h1>
          
          <div className="prose prose-invert prose-lg max-w-none text-gray-300">
            <p className="mb-6">
              Welcome to Efren Billiards and Events Place. By accessing our premises or using our services, you agree to comply with and be bound by the following terms and conditions.
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">1. Membership</h3>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              <li>Membership cards are non-transferable unless explicitly stated otherwise.</li>
              <li>Membership fees are non-refundable.</li>
              <li>We reserve the right to revoke membership for violation of house rules.</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">2. Facility Usage</h3>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              <li>Proper attire is required at all times.</li>
              <li>Any damage to equipment caused by negligence or misuse will be charged to the customer.</li>
              <li>Smoking is only allowed in designated areas.</li>
              <li>Outside food and drinks are not permitted.</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">3. Bookings and Reservations</h3>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              <li>Reservations are subject to availability.</li>
              <li>Cancellations must be made at least 24 hours in advance.</li>
              <li>Late arrivals may result in forfeiture of the reservation.</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">4. Events</h3>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              <li>Event bookings require a deposit to secure the date.</li>
              <li>The deposit is non-refundable if the event is cancelled within 7 days of the scheduled date.</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">5. Liability</h3>
            <p className="mb-6">
              Efren Billiards and Events Place is not liable for any loss or damage to personal property left on the premises.
            </p>

            <p className="mt-12 text-sm text-gray-500">
              Last updated: February 2026
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
};

export default TermsAndConditions;
