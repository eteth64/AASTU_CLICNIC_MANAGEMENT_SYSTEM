import React, { useState, useEffect } from 'react';

interface KeyValuePair {
  key: string;
  value: string;
}

interface KeyValueInputProps {
  onChange: (data: Record<string, string>) => void;
  initialData?: Record<string, string>;
}

const KeyValueInput: React.FC<KeyValueInputProps> = ({ onChange, initialData = {} }) => {
  const [pairs, setPairs] = useState<KeyValuePair[]>([{ key: '', value: '' }]);

  // Notify parent of changes
  useEffect(() => {
    const result: Record<string, string> = {};
    pairs.forEach(pair => {
      if (pair.key.trim() && pair.value.trim()) {
        result[pair.key] = pair.value;
      }
    });
    onChange(result);
  }, [pairs, onChange]);

  const handleKeyChange = (index: number, key: string) => {
    setPairs(prev => {
      const newPairs = [...prev];
      newPairs[index] = { ...newPairs[index], key };
      
      // Add a new empty pair if this is the last pair and user is typing
      if (index === newPairs.length - 1 && key.trim() !== '') {
        return [...newPairs, { key: '', value: '' }];
      }
      
      return newPairs;
    });
  };

  const handleValueChange = (index: number, value: string) => {
    setPairs(prev => {
      const newPairs = [...prev];
      newPairs[index] = { ...newPairs[index], value };
      return newPairs;
    });
  };

  const removePair = (index: number) => {
    setPairs(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground mb-2">
        <div className="col-span-5">Test Name</div>
        <div className="col-span-5">Result Value</div>
        <div className="col-span-2">Action</div>
      </div>
      
      {pairs.map((pair, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Test name (e.g., Hemoglobin)"
            value={pair.key}
            onChange={(e) => handleKeyChange(index, e.target.value)}
            className="flex-1 p-2 border rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="Result value (e.g., 14.2 g/dL)"
            value={pair.value}
            onChange={(e) => handleValueChange(index, e.target.value)}
            className="flex-1 p-2 border rounded-md text-sm"
          />
          {pairs.length > 1 && index !== pairs.length - 1 && (
            <button
              type="button"
              onClick={() => removePair(index)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
              title="Remove this test"
            >
              ×
            </button>
          )}
        </div>
      ))}
      
      <p className="text-xs text-muted-foreground mt-2">
        Start typing a test name to add more tests. Only pairs with both fields filled will be submitted.
      </p>
    </div>
  );
};

export default KeyValueInput;