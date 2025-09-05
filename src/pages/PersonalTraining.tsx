import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Dumbbell, 
  Clock, 
  Users, 
  Star,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Award,
  Target,
  Zap
} from 'lucide-react';

const PersonalTraining: React.FC = () => {
  const { user } = useAuth();

  const trainers = [
    {
      id: '1',
      name: 'Μαρία Παπαδοπούλου',
      specialty: 'Personal Training & Kick Boxing',
      experience: '8+ χρόνια',
      rating: 4.9,
      image: '/api/placeholder/150/150',
      certifications: ['ACE Personal Trainer', 'Kick Boxing Instructor'],
      bio: 'Εξειδικευμένη σε Personal Training και Kick Boxing με 8+ χρόνια εμπειρίας.',
      schedule: [
        { day: 'Δευτέρα', time: '09:00 - 21:00' },
        { day: 'Τρίτη', time: '09:00 - 21:00' },
        { day: 'Τετάρτη', time: '09:00 - 21:00' },
        { day: 'Πέμπτη', time: '09:00 - 21:00' },
        { day: 'Παρασκευή', time: '09:00 - 20:00' }
      ]
    },
    {
      id: '2',
      name: 'Γιάννης Κωνσταντίνου',
      specialty: 'Kick Boxing & MMA',
      experience: '10+ χρόνια',
      rating: 4.8,
      image: '/api/placeholder/150/150',
      certifications: ['Kick Boxing Black Belt', 'MMA Coach'],
      bio: 'Προπονητής Kick Boxing και MMA με 10+ χρόνια εμπειρίας σε αγώνες.',
      schedule: [
        { day: 'Δευτέρα', time: '18:00 - 22:00' },
        { day: 'Τρίτη', time: '18:00 - 22:00' },
        { day: 'Τετάρτη', time: '18:00 - 22:00' },
        { day: 'Πέμπτη', time: '18:00 - 22:00' },
        { day: 'Σάββατο', time: '10:00 - 16:00' }
      ]
    }
  ];

  const services = [
    {
      name: 'Personal Training Χρήστης',
      description: 'Το προσωποποιημένο πρόγραμμα προπόνησής σας είναι έτοιμο!',
      duration: '50 λεπτά',
      price: 'Συμπεριλαμβάνεται',
      icon: Dumbbell,
      features: ['Προσωποποιημένο πρόγραμμα', 'Ατομική προπόνηση', 'Παρακολούθηση προόδου'],
      hasButton: false,
      isUserService: true,
      statusMessage: 'Το πρόγραμμά σας σας περιμένει!',
      instructionMessage: 'Πηγαίνετε στο μενού "Personal Training" για να δείτε το προσωποποιημένο πρόγραμμα που έχει δημιουργηθεί για εσάς.'
    },
    {
      name: 'Πασπαρτού Personal',
      description: 'Εξειδικευμένες προπονήσεις για μη εγγεγραμμένους χρήστες',
      duration: '50 λεπτά',
      price: '€45/μάθημα',
      icon: Target,
      features: [
        'Αξιολόγηση φυσικής κατάστασης',
        'Προσωποποιημένο πρόγραμμα',
        'Εξειδικευμένη προπόνηση',
        'Personal συνεδρίες → 4 συνεδρίες',
        'Group συνεδρίες → 4 συνεδρίες'
      ],
      hasButton: false,
      isUserService: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Personal Training & Kick Boxing
            </h1>
            <p className="text-xl text-purple-100 mb-8">
              Εξειδικευμένες προπονήσεις με τους καλύτερους προπονητές
            </p>
            <div className="flex justify-center space-x-8 text-purple-100">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Πιστοποιημένοι Προπονητές</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Προσωποποιημένα Προγράμματα</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>4.8+ Αξιολόγηση</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Services */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Υπηρεσίες</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className={`rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow ${
                  service.isUserService 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200' 
                    : 'bg-white'
                }`}>
                  <div className="text-center mb-6">
                    <div className={`p-4 rounded-full inline-block mb-4 ${
                      service.isUserService 
                        ? 'bg-green-100' 
                        : 'bg-purple-100'
                    }`}>
                      <Icon className={`h-8 w-8 ${
                        service.isUserService 
                          ? 'text-green-600' 
                          : 'text-purple-600'
                      }`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="flex justify-center space-x-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.duration}
                      </span>
                      <span className={`font-semibold ${
                        service.isUserService 
                          ? 'text-green-600' 
                          : 'text-purple-600'
                      }`}>{service.price}</span>
                    </div>
                  </div>
                  
                  {/* Success Message for User Service */}
                  {service.isUserService && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Star className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-green-800 mb-1">
                            {service.statusMessage}
                          </h4>
                          <p className="text-sm text-green-700">
                            {service.instructionMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          service.isUserService 
                            ? 'bg-green-500' 
                            : 'bg-purple-500'
                        }`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {service.hasButton && (
                    <button 
                      onClick={service.onButtonClick}
                      className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      {service.buttonText}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Trainers */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Οι Προπονητές μας</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                      <Users className="h-10 w-10 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{trainer.name}</h3>
                      <p className="text-purple-600 font-medium mb-2">{trainer.specialty}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center">
                          <Award className="h-4 w-4 mr-1" />
                          {trainer.experience}
                        </span>
                        <span className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          {trainer.rating}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{trainer.bio}</p>
                      
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Πιστοποιήσεις:</h4>
                        <div className="flex flex-wrap gap-2">
                          {trainer.certifications.map((cert, index) => (
                            <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Ωράριο:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {trainer.schedule.map((slot, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-gray-600">{slot.day}:</span>
                              <span className="font-medium">{slot.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4">
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                    Κράτηση με {trainer.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Επικοινωνία</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-full inline-block mb-4">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Διεύθυνση</h3>
              <p className="text-gray-600">Οδός Γυμναστηρίου 123<br />106 77 Αθήνα</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-full inline-block mb-4">
                <Phone className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Τηλέφωνο</h3>
              <p className="text-gray-600">210 123 4567<br />Καθημερινά 08:00-22:00</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-full inline-block mb-4">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">personal@freegym.com<br />kickboxing@freegym.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalTraining;
