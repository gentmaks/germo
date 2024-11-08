import { useState } from 'react';
import { Bell, X, Plus, Check } from 'lucide-react';

type AlertCriteria = {
  type: 'company' | 'location' | 'keyword';
  value: string;
};

type AlertFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AlertForm({ isOpen, onClose }: AlertFormProps) {
  const [email, setEmail] = useState('');
  const [criteria, setCriteria] = useState<AlertCriteria[]>([]);
  const [newCriteriaType, setNewCriteriaType] = useState<'company' | 'location' | 'keyword'>('company');
  const [newCriteriaValue, setNewCriteriaValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAddCriteria = () => {
    if (newCriteriaValue.trim()) {
      setCriteria([...criteria, { type: newCriteriaType, value: newCriteriaValue.trim() }]);
      setNewCriteriaValue('');
    }
  };

  const handleRemoveCriteria = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || criteria.length === 0) {
      setError('Please provide an email and at least one alert criteria');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, criteria }),
      });

      if (!response.ok) throw new Error('Failed to subscribe');

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setEmail('');
        setCriteria([]);
      }, 2000);
    } catch (err) {
      setError(`${err}. Failed to set up alert. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed font-mono inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-md font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Set Up Job Alerts
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border text-xs border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alert Criteria
            </label>
            <div className="flex gap-2 mb-2">
              <select
                value={newCriteriaType}
                onChange={(e) => setNewCriteriaType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs focus:outline-none"
              >
                <option value="company">Company</option>
                <option value="location">Location</option>
                <option value="keyword">Keyword</option>
              </select>
              <input
                type="text"
                value={newCriteriaValue}
                onChange={(e) => setNewCriteriaValue(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs focus:outline-none"
                placeholder="Enter value..."
              />
              <button
                type="button"
                onClick={handleAddCriteria}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {criteria.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-xs">
                    <span className="font-medium">{item.type}:</span> {item.value}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCriteria(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              'Setting up...'
            ) : success ? (
              <>
                <Check className="w-5 h-5" />
                Alert Set Up!
              </>
            ) : (
              <>
                <Bell className="w-5 h-5" />
                Set Up Alert
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}