import { Calendar, TrendingUp, MapPin, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const token = useSelector((s) => s.auth.token);
  const navigate = useNavigate();
  function handleStart() {
    if (token) navigate('/dashboard');
    else navigate('/login');
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100/50 to-transparent pointer-events-none"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 mb-6">
            <Sparkles className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Your Journey Starts Here</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Plan smarter.
            <br />
            <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              Travel better.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Travel Planner helps you craft beautiful itineraries, track budgets, and capture memories — all in a clean, modern workspace designed for explorers.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button onClick={handleStart} className="group px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to plan
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Powerful features wrapped in an intuitive interface
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Calendar className="w-8 h-8" />}
            title="Itinerary Builder"
            desc="Add day-wise plans, drag & drop activities, and keep notes with markdown support for rich formatting."
            gradient="from-gray-50 to-gray-100"
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Budget & Analytics"
            desc="Track expenses by day and category. Visualize your spending with interactive charts and insights."
            gradient="from-gray-100 to-gray-50"
          />
          <FeatureCard
            icon={<MapPin className="w-8 h-8" />}
            title="Smart Destinations"
            desc="Search destinations with Places autocomplete and organize your complete trip timeline effortlessly."
            gradient="from-gray-50 to-gray-100"
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border-2 border-gray-200 p-10 md:p-16 shadow-xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why travelers love our platform
              </h2>
              <div className="space-y-4">
                <BenefitItem text="Real-time budget tracking and alerts" />
                <BenefitItem text="Markdown notes for detailed planning" />
                <BenefitItem text="Beautiful, distraction-free design" />
                <BenefitItem text="Secure authentication & data storage" />
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg"></div>
                    <div className="h-20 bg-gradient-to-br from-gray-200 to-gray-100 rounded-lg"></div>
                    <div className="h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gray-900 rounded-2xl opacity-5"></div>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Ready to plan your next adventure?
        </h2>
        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of travelers who trust our platform for their journey planning
        </p>
        <button onClick={handleStart} className="group px-10 py-5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 mx-auto shadow-xl hover:shadow-2xl">
          Start Planning Now
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc, gradient }) {
  return (
    <div className={`group relative bg-gradient-to-br ${gradient} rounded-2xl border-2 border-gray-200 p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-gray-300`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-900 opacity-0 group-hover:opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 transition-opacity duration-300"></div>

      <div className="relative">
        <div className="inline-flex p-3 bg-white rounded-xl border-2 border-gray-200 mb-5 group-hover:border-gray-300 transition-colors">
          <div className="text-gray-900">
            {icon}
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

function BenefitItem({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-4 h-4 text-white" />
      </div>
      <span className="text-gray-700 font-medium">{text}</span>
    </div>
  );
}