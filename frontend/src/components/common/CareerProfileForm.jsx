import { motion } from 'framer-motion';
import {
  INTEREST_AREAS,
  STRENGTHS,
  INDUSTRY_STREAMS,
  EDUCATION_LEVELS_COMPREHENSIVE,
  BUDGET_RANGES_COMPREHENSIVE,
  LOCATION_PREFERENCES,
  WORK_LIFE_BALANCE,
  RISK_TOLERANCE,
  INTERACTION_STYLE,
} from '../../constants';

function CareerProfileForm({ formData, onChange, showOptional = true }) {
  const handleCheckboxChange = (field, value) => {
    const currentArray = formData[field] || [];
    if (currentArray.includes(value)) {
      onChange(field, currentArray.filter(item => item !== value));
    } else {
      onChange(field, [...currentArray, value]);
    }
  };

  const handleSelectChange = (field, value) => {
    onChange(field, value);
  };

  const getSelectedCount = (field) => {
    const value = formData[field];
    return Array.isArray(value) ? value.length : 0;
  };

  const maxInterestAreas = 2;
  const maxStrengths = 2;

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* MANDATORY SECTION */}
      <div>
        <h3 className="text-lg font-display font-bold text-white mb-4">📋 Your Career Profile (AI Inputs)</h3>
        <p className="text-sm text-surface-400 mb-6">Complete all mandatory questions to get accurate AI-powered recommendations.</p>

        {/* 1. Interest Areas */}
        <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <label className="block text-sm font-medium text-white mb-3">
            1. Interest Areas <span className="text-red-400">*</span> (Choose 1-2)
          </label>
          <div className="space-y-2">
            {INTEREST_AREAS.map((area) => (
              <motion.label
                key={area.value}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                whileHover={{ x: 5 }}
              >
                <input
                  type="checkbox"
                  checked={(formData.interests || []).includes(area.value)}
                  onChange={() => {
                    if ((formData.interests || []).length < maxInterestAreas || (formData.interests || []).includes(area.value)) {
                      handleCheckboxChange('interests', area.value);
                    }
                  }}
                  disabled={(formData.interests || []).length >= maxInterestAreas && !(formData.interests || []).includes(area.value)}
                  className="mt-1 w-4 h-4 rounded accent-primary-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{area.label}</div>
                  <div className="text-xs text-surface-400 mt-0.5">{area.description}</div>
                </div>
              </motion.label>
            ))}
          </div>
          {(formData.interests || []).length > 0 && (
            <p className="text-xs text-primary-400 mt-2">{(formData.interests || []).length}/{maxInterestAreas} selected</p>
          )}
        </motion.div>

        {/* 2. Strengths */}
        <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <label className="block text-sm font-medium text-white mb-3">
            2. Strengths <span className="text-red-400">*</span> (Choose top 2)
          </label>
          <div className="space-y-2">
            {STRENGTHS.map((strength) => (
              <motion.label
                key={strength.value}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                whileHover={{ x: 5 }}
              >
                <input
                  type="checkbox"
                  checked={(formData.strengths || []).includes(strength.value)}
                  onChange={() => {
                    if ((formData.strengths || []).length < maxStrengths || (formData.strengths || []).includes(strength.value)) {
                      handleCheckboxChange('strengths', strength.value);
                    }
                  }}
                  disabled={(formData.strengths || []).length >= maxStrengths && !(formData.strengths || []).includes(strength.value)}
                  className="mt-1 w-4 h-4 rounded accent-primary-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{strength.label}</div>
                  <div className="text-xs text-surface-400 mt-0.5">{strength.description}</div>
                </div>
              </motion.label>
            ))}
          </div>
          {(formData.strengths || []).length > 0 && (
            <p className="text-xs text-primary-400 mt-2">{(formData.strengths || []).length}/{maxStrengths} selected</p>
          )}
        </motion.div>

        {/* 3. Preferred Industry/Stream */}
        <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <label className="block text-sm font-medium text-white mb-3">
            3. Preferred Stream / Industry <span className="text-red-400">*</span> (Choose 1)
          </label>
          <div className="space-y-2">
            {INDUSTRY_STREAMS.map((stream) => (
              <motion.label
                key={stream.value}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                whileHover={{ x: 5 }}
              >
                <input
                  type="radio"
                  name="industry_stream"
                  value={stream.value}
                  checked={formData.industry_stream === stream.value}
                  onChange={() => handleSelectChange('industry_stream', stream.value)}
                  className="mt-1 w-4 h-4 accent-primary-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{stream.label}</div>
                  <div className="text-xs text-surface-400 mt-0.5">{stream.description}</div>
                </div>
              </motion.label>
            ))}
          </div>
        </motion.div>

        {/* 4. Education Level */}
        <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <label className="block text-sm font-medium text-white mb-3">
            4. Education Level <span className="text-red-400">*</span>
          </label>
          <div className="space-y-2">
            {EDUCATION_LEVELS_COMPREHENSIVE.map((level) => (
              <motion.label
                key={level.value}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                whileHover={{ x: 5 }}
              >
                <input
                  type="radio"
                  name="education_level"
                  value={level.value}
                  checked={formData.education_level === level.value}
                  onChange={() => handleSelectChange('education_level', level.value)}
                  className="mt-1 w-4 h-4 accent-primary-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{level.label}</div>
                  <div className="text-xs text-surface-400 mt-0.5">{level.description}</div>
                </div>
              </motion.label>
            ))}
          </div>
        </motion.div>

        {/* 5. Budget Range */}
        <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <label className="block text-sm font-medium text-white mb-3">
            5. Budget Range for Training <span className="text-red-400">*</span>
          </label>
          <div className="space-y-2">
            {BUDGET_RANGES_COMPREHENSIVE.map((budget) => (
              <motion.label
                key={budget.value}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                whileHover={{ x: 5 }}
              >
                <input
                  type="radio"
                  name="budget"
                  value={budget.value}
                  checked={formData.budget === budget.value}
                  onChange={() => handleSelectChange('budget', budget.value)}
                  className="mt-1 w-4 h-4 accent-primary-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{budget.label}</div>
                  <div className="text-xs text-surface-400 mt-0.5">{budget.description}</div>
                </div>
              </motion.label>
            ))}
          </div>
        </motion.div>

        {/* 6. Location Preference */}
        <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <label className="block text-sm font-medium text-white mb-3">
            6. Location Preference <span className="text-red-400">*</span>
          </label>
          <div className="space-y-2">
            {LOCATION_PREFERENCES.map((location) => (
              <motion.label
                key={location.value}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                whileHover={{ x: 5 }}
              >
                <input
                  type="radio"
                  name="location"
                  value={location.value}
                  checked={formData.location === location.value}
                  onChange={() => handleSelectChange('location', location.value)}
                  className="mt-1 w-4 h-4 accent-primary-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{location.label}</div>
                  <div className="text-xs text-surface-400 mt-0.5">{location.description}</div>
                </div>
              </motion.label>
            ))}
          </div>
        </motion.div>
      </div>

      {/* OPTIONAL SECTION */}
      {showOptional && (
        <div className="pt-6 border-t border-white/10">
          <h3 className="text-lg font-display font-bold text-white mb-4">✨ Optional Preferences</h3>
          <p className="text-sm text-surface-400 mb-6">Fine-tune predictions by adding lifestyle preferences.</p>

          {/* 7. Work-Life Balance */}
          <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-white mb-3">
              7. Work-Life Balance Preference
            </label>
            <div className="space-y-2">
              {WORK_LIFE_BALANCE.map((item) => (
                <motion.label
                  key={item.value}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                  whileHover={{ x: 5 }}
                >
                  <input
                    type="radio"
                    name="work_life_balance"
                    value={item.value}
                    checked={formData.work_life_balance === item.value}
                    onChange={() => handleSelectChange('work_life_balance', item.value)}
                    className="mt-1 w-4 h-4 accent-primary-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-xs text-surface-400 mt-0.5">{item.description}</div>
                  </div>
                </motion.label>
              ))}
            </div>
          </motion.div>

          {/* 8. Risk Tolerance */}
          <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-white mb-3">
              8. Risk Tolerance
            </label>
            <div className="space-y-2">
              {RISK_TOLERANCE.map((item) => (
                <motion.label
                  key={item.value}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                  whileHover={{ x: 5 }}
                >
                  <input
                    type="radio"
                    name="risk_tolerance"
                    value={item.value}
                    checked={formData.risk_tolerance === item.value}
                    onChange={() => handleSelectChange('risk_tolerance', item.value)}
                    className="mt-1 w-4 h-4 accent-primary-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-xs text-surface-400 mt-0.5">{item.description}</div>
                  </div>
                </motion.label>
              ))}
            </div>
          </motion.div>

          {/* 9. Daily Interaction Style */}
          <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-white mb-3">
              9. Daily Interaction Style
            </label>
            <div className="space-y-2">
              {INTERACTION_STYLE.map((item) => (
                <motion.label
                  key={item.value}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                  whileHover={{ x: 5 }}
                >
                  <input
                    type="radio"
                    name="interaction_style"
                    value={item.value}
                    checked={formData.interaction_style === item.value}
                    onChange={() => handleSelectChange('interaction_style', item.value)}
                    className="mt-1 w-4 h-4 accent-primary-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-xs text-surface-400 mt-0.5">{item.description}</div>
                  </div>
                </motion.label>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default CareerProfileForm;
