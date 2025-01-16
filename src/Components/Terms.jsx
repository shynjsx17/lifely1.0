import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using Lifely, you accept and agree to be bound by the terms and conditions of this agreement.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
            <p>Lifely is a personal task management and diary application that allows users to:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Create and manage tasks</li>
              <li>Write and maintain personal notes</li>
              <li>Track daily activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
            <p>To use Lifely, you must:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Create an account with valid information</li>
              <li>Maintain the security of your account</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Violate any laws or regulations</li>
              <li>Interfere with the proper working of the service</li>
              <li>Attempt to bypass any security measures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Modifications to Service</h2>
            <p>We reserve the right to modify or discontinue the service at any time without notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Contact</h2>
            <p>For any questions regarding these Terms of Service, please contact us.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms; 