import React from 'react';

interface LabResultDisplayProps {
  labResult: Record<string, string>; // Can be object or string
}

const LabResultDisplay: React.FC<LabResultDisplayProps> = ({ labResult }) => {
  // Handle both string and object formats
  let results: Record<string, string> = {};

 console.log('LabResultDisplay received labResult:', labResult);

  if (typeof labResult === 'string') {
    try {
      results = JSON.parse(labResult);
    } catch (e) {
      return <p className="text-sm">Invalid result format</p>;
    }
  } else if (typeof labResult === 'object') {
    results = labResult;
  }



  if (!results || Object.keys(results).length === 0) {
    return <p className="text-sm">No results available</p>;
  }




  return (
    <div className="space-y-2">
      {Object.entries(results).map(([key, value], index) => (
        <div key={index} className="flex gap-2 ">
          <span className=" text-sm">{key}:</span>
          <span className="text-sm">{value}</span>
        </div>
      ))}
    </div>
  );
};

export default LabResultDisplay;